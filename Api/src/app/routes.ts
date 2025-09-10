import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import healthRoutes from '../modules/health/health.routes.js'
// import ... otras rutas

const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes)

// router.use('/users', usersRoutes);
// router.use('/projects', projectsRoutes);
// router.use('/tasks', tasksRoutes);
// router.use('/notifications', notificationsRoutes);

export default router;
