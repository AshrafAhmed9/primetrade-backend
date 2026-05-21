import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  role: string;
  username: string;
}

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};
