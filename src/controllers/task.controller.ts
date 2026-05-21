import { Request, Response } from 'express';
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from '../services/task.service';
import { successResponse } from '../utils/apiResponse';
import { TaskQueryInput } from '../schemas/task.schema';

export const create = async (req: Request, res: Response) => {
  const task = await createTask(req.body, req.user!.userId, req.user!.username);
  successResponse(res, task, 'Task created', 201);
};

export const list = async (req: Request, res: Response) => {
  const { tasks, meta } = await getTasks(
    req.query as unknown as TaskQueryInput,
    req.user!.userId,
    req.user!.role
  );
  successResponse(res, tasks, 'Tasks fetched', 200, meta);
};

export const getOne = async (req: Request, res: Response) => {
  const task = await getTaskById(String(req.params.id), req.user!.userId, req.user!.role);
  successResponse(res, task);
};

export const update = async (req: Request, res: Response) => {
  const task = await updateTask(
    String(req.params.id),
    req.body,
    req.user!.userId,
    req.user!.role,
    req.user!.username
  );
  successResponse(res, task, 'Task updated');
};

export const remove = async (req: Request, res: Response) => {
  await deleteTask(String(req.params.id), req.user!.userId, req.user!.role);
  successResponse(res, null, 'Task deleted');
};
