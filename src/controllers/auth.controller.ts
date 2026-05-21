import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  refreshUserTokens,
  logoutUser,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
  CLEAR_COOKIE_OPTIONS,
} from '../services/auth.service';
import { successResponse } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/prisma';

export const register = async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await registerUser(req.body);

  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  successResponse(res, { ...user, accessToken }, 'Registration successful', 201);
};

export const login = async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);

  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  successResponse(res, { ...user, accessToken }, 'Login successful');
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('Refresh token required', 401);

  const { user, accessToken, refreshToken } = await refreshUserTokens(token);

  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  successResponse(res, { ...user, accessToken }, 'Token refreshed');
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (token) await logoutUser(token);

  res.clearCookie('accessToken', CLEAR_COOKIE_OPTIONS);
  res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);

  successResponse(res, null, 'Logged out successfully');
};

export const getMe = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, username: true, role: true, createdAt: true },
  });

  if (!user) throw new AppError('User not found', 404);
  successResponse(res, user);
};
