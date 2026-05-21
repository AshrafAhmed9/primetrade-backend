import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { create, list, getOne, update, remove } from '../../controllers/task.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../../schemas/task.schema';
import { z } from 'zod';

const router = Router();

const taskLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

const idParamSchema = z.object({ id: z.string().uuid('Invalid task ID') });

router.use(authenticate);

router.post('/', taskLimiter, validate({ body: createTaskSchema }), create);
router.get('/', validate({ query: taskQuerySchema }), list);
router.get('/:id', validate({ params: idParamSchema }), getOne);
router.patch('/:id', validate({ params: idParamSchema, body: updateTaskSchema }), update);
router.delete('/:id', validate({ params: idParamSchema }), remove);

export default router;
