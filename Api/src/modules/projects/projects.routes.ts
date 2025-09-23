import { Router } from 'express';
import { projectController } from './projects.controller.js';

const router = Router();

// TDI-80: Obtener todos los proyectos
router.get('/', projectController.getAllProjects);

// TDI-81: Obtener proyecto por ID
router.get('/:id', projectController.getProjectById);

// TDI-79: Crear proyecto
router.post('/', projectController.createProject);

// TDI-82: Actualizar proyecto
router.put('/:id', projectController.updateProject);

// TDI-83: Eliminar proyecto
router.delete('/:id', projectController.deleteProject);

export default router;