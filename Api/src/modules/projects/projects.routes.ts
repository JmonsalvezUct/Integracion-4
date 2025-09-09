import { Router } from 'express';
import { projectController } from './projects.controller';

const router = Router();

// TDI-80: Obtener todos los proyectos
router.get('/projects', projectController.getAllProjects);

// TDI-81: Obtener proyecto por ID
router.get('/projects/:id', projectController.getProjectById);

// TDI-79: Crear proyecto
router.post('/projects', projectController.createProject);

// TDI-82: Actualizar proyecto
router.put('/projects/:id', projectController.updateProject);

// TDI-83: Eliminar proyecto
router.delete('/projects/:id', projectController.deleteProject);

export default router;