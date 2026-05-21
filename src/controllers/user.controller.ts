import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { successResponse } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';

const USER_SELECT = {
  id: true,
  email: true,
  username: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export const listUsers = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: USER_SELECT,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  successResponse(res, users, 'Users fetched', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};

export const getUser = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: USER_SELECT,
  });

  if (!user) throw new AppError('User not found', 404);
  successResponse(res, user);
};

export const updateRole = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new AppError('User not found', 404);

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: req.body.role },
    select: USER_SELECT,
  });

  successResponse(res, updated, 'Role updated');
};

export const softDeleteUser = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new AppError('User not found', 404);
  if (!user.isActive) throw new AppError('User already deactivated', 400);

  await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });

  successResponse(res, null, 'User deactivated');
};
