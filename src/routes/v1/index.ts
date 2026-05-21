import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { successResponse } from '../../utils/apiResponse';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import taskRoutes from './task.routes';

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    successResponse(res, {
      status: 'ok',
      database: 'connected',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({ success: false, error: 'Database unavailable' });
  }
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);

export default router;
