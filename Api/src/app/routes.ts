
import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import healthRoutes from '../modules/health/health.routes.js';
import tasksRoutes from '../modules/tasks/tasks.routes.js';
import projectsRoutes from '../modules/projects/projects.routes.js';
import attachmentRoutes from '../modules/attachments/attachments.routes.js';
import changeHistoryRoutes from "../modules/change-history/changeHistory.routes.js";
import swaggerUI from 'swagger-ui-express'
import specs from '../swagger/swagger.js';

const router = Router();

router.use('/health', healthRoutes);      
router.use('/auth', authRoutes);
router.use('/tasks', tasksRoutes);
router.use('/projects', projectsRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/docs', swaggerUI.serve, swaggerUI.setup(specs))

router.use("/history", changeHistoryRoutes);
export default router;
