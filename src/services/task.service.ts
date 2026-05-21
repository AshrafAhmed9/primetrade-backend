import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '../schemas/task.schema';
import { TaskStatus } from '@prisma/client';

export const createTask = async (
  data: CreateTaskInput,
  userId: string,
  username: string
) => {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: (data.status as TaskStatus) ?? TaskStatus.PENDING,
      userId,
      createdBy: username,
    },
  });
};

export const getTasks = async (
  query: TaskQueryInput,
  userId: string,
  role: string
) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const allowedSorts = ['createdAt', 'updatedAt', 'title'] as const;
  const sort = allowedSorts.includes(query.sort as typeof allowedSorts[number])
    ? query.sort
    : 'createdAt';
  const order = query.order === 'asc' ? ('asc' as const) : ('desc' as const);

  const whereUser = role !== 'ADMIN' ? { userId } : {};
  const whereStatus = query.status ? { status: query.status as TaskStatus } : {};
  const where = { ...whereUser, ...whereStatus };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: { user: { select: { username: true, email: true } } },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getTaskById = async (id: string, userId: string, role: string) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { user: { select: { username: true, email: true } } },
  });

  if (!task) throw new AppError('Task not found', 404);
  if (role !== 'ADMIN' && task.userId !== userId) throw new AppError('Forbidden', 403);

  return task;
};

export const updateTask = async (
  id: string,
  data: UpdateTaskInput,
  userId: string,
  role: string,
  username: string
) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new AppError('Task not found', 404);
  if (role !== 'ADMIN' && task.userId !== userId) throw new AppError('Forbidden', 403);

  return prisma.task.update({
    where: { id },
    data: { ...data, updatedBy: username },
  });
};

export const deleteTask = async (id: string, userId: string, role: string) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new AppError('Task not found', 404);
  if (role !== 'ADMIN' && task.userId !== userId) throw new AppError('Forbidden', 403);

  await prisma.task.delete({ where: { id } });
};
