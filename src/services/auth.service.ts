import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { CookieOptions } from 'express';
import { env } from '../config/env';

const isProduction = env.NODE_ENV === 'production';

export const ACCESS_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const CLEAR_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
};

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  username: true,
  role: true,
  createdAt: true,
};

const generateTokens = (user: { id: string; role: string; username: string }) => {
  const payload = { userId: user.id, role: user.role, username: user.username };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

const saveRefreshToken = async (userId: string, token: string) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
};

export const registerUser = async (data: RegisterInput) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  });

  if (existing) {
    const field = existing.email === data.email ? 'Email' : 'Username';
    throw new AppError(`${field} already in use`, 409);
  }

  const hashed = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: { email: data.email, username: data.username, password: hashed },
    select: USER_PUBLIC_SELECT,
  });

  const { accessToken, refreshToken } = generateTokens(user);
  await saveRefreshToken(user.id, refreshToken);

  return { user, accessToken, refreshToken };
};

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials', 401);
  }

  const valid = await comparePassword(data.password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const { accessToken, refreshToken } = generateTokens(user);
  await saveRefreshToken(user.id, refreshToken);

  const { id, email, username, role, createdAt } = user;
  return { user: { id, email, username, role, createdAt }, accessToken, refreshToken };
};

export const refreshUserTokens = async (token: string) => {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  verifyRefreshToken(token); // throws if tampered

  // rotate: delete old token, issue new pair
  await prisma.refreshToken.delete({ where: { token } });

  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
    select: USER_PUBLIC_SELECT,
  });

  if (!user) throw new AppError('User not found', 404);

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
  await saveRefreshToken(user.id, newRefreshToken);

  return { user, accessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (token: string) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};
