import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { errorResponse } from '../utils/apiResponse';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode, err.details);
  }

  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    return errorResponse(res, 'Database operation failed', 400);
  }

  const message = env.NODE_ENV === 'development' ? err.message : 'Internal server error';
  console.error('[ERROR]', err.constructor.name, err.message);
  return errorResponse(res, message, 500);
};
