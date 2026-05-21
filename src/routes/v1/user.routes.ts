import { Router } from 'express';
import { listUsers, getUser, updateRole, softDeleteUser } from '../../controllers/user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateRoleSchema, paginationSchema } from '../../schemas/user.schema';
import { z } from 'zod';

const router = Router();

const idParamSchema = z.object({ id: z.string().uuid('Invalid user ID') });

router.use(authenticate, requireRole('ADMIN'));

router.get('/', validate({ query: paginationSchema }), listUsers);
router.get('/:id', validate({ params: idParamSchema }), getUser);
router.patch('/:id/role', validate({ params: idParamSchema, body: updateRoleSchema }), updateRole);
router.delete('/:id', validate({ params: idParamSchema }), softDeleteUser);

export default router;
