import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

interface ValidateSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validate = (schemas: ValidateSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: string[] = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push(...result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`));
      } else {
        req.body = result.data;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push(...result.error.issues.map((e) => `params.${e.path.join('.')}: ${e.message}`));
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push(...result.error.issues.map((e) => `query.${e.path.join('.')}: ${e.message}`));
      } else {
        Object.assign(req.query, result.data);
      }
    }

    if (errors.length > 0) {
      throw new AppError('Validation failed', 422, errors);
    }

    next();
  };
};
