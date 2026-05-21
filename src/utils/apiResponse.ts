import { Response } from 'express';

interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export const successResponse = (
  res: Response,
  data: unknown,
  message = 'Success',
  statusCode = 200,
  meta?: Meta
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown[]
) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
  });
};
