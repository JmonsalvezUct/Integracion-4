import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import healthRoutes from '../modules/health/health.routes.js'
import tasksRoutes from "../modules/tasks/tasks.routes.js"; 
import swaggerUI from 'swagger-ui-express'
import specs from '../swagger/swagger.js';
import projectRoutes from '../modules/projects/projects.routes.js';
import attachmentRoutes from '../modules/attachments/attachments.routes.js'

const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes)
router.use('/docs', swaggerUI.serve, swaggerUI.setup(specs))
router.use("/tasks", tasksRoutes);
router.use("/projects", projectRoutes);
router.use("/attachments", attachmentRoutes);

// router.use('/users', usersRoutes);
// router.use('/notifications', notificationsRoutes);

export default router;





