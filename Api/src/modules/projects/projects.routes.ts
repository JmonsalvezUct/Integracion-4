import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { authorizeProject } from "./authorize.middleware";
import { getProjectTasks as getProjectTasksVal } from "./projects.validators";
import { getProjectTasks } from "./projects.controller";

import { projectController } from './projects.controller.js';

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

router.get(
  "/:id/tasks",
  authorizeProject(["owner", "admin", "member"]),  
  validate(getProjectTasksVal),
  getProjectTasks
);

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





