import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { authorizeProject } from "./authorize.middleware.js";
import { getProjectTasks as getProjectTasksVal } from "./projects.validators.js";
import { getProjectTasks } from "./projects.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { projectController } from './projects.controller.js';
import { cloneProjectSchema } from "./projects.validators.js";                // ajusta path
import { cloneProjectController } from "./projects.controller.js"; 
const router = Router();
/**
 * @openapi
 * /projects/{id}/tasks:
 *   get:
 *     summary: Listar tareas de un proyecto
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: ID del proyecto
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *       - $ref: '#/components/parameters/SortParam'
 *       - $ref: '#/components/parameters/OrderParam'
 *       - $ref: '#/components/parameters/StatusParam'
 *       - $ref: '#/components/parameters/QParam'
 *     responses:
 *       200:
 *         description: Lista de tareas del proyecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskListResponse'
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

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
