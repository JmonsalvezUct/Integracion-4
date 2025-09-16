
import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import healthRoutes from '../modules/health/health.routes.js';
import tasksRoutes from '../modules/tasks/tasks.routes.js';
import projectsRoutes from '../modules/projects/projects.routes.js';
import attachmentRoutes from '../modules/attachments/attachments.routes.js';

const router = Router();

router.use('/health', healthRoutes);      
router.use('/auth', authRoutes);
router.use('/tasks', tasksRoutes);
router.use('/projects', projectsRoutes);
router.use('/attachments', attachmentRoutes);

export default router;
