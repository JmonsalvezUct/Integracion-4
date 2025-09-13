import { Router } from 'express';
import projectRoutes from '../modules/projects/projects.routes';
import taskRoutes from '../modules/tasks/attachments.routes';

const router = Router();

router.use('/projects', projectRoutes);
// Aquí agregarás otras rutas más adelante

//router.use('/tasks', attachmentRoutes); 
router.use('/tasks', taskRoutes);

export default router;
router.get('/test-debug', (req, res) => res.json({ message: 'Funciona' }));
