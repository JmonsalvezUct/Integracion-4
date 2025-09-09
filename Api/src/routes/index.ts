import { Router } from 'express';
import projectRoutes from '../modules/projects/projects.routes';

const router = Router();

router.use('/projects', projectRoutes);
// Aquí agregarás otras rutas más adelante

export default router;