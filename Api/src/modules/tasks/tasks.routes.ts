import { Router } from 'express';
import {
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByProject,
  assignTask,
  changeStatus,
} from './tasks.controller.js';

import { rbacMiddleware } from "../../middlewares/rbac.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /tasks/{projectId}:
 *   post:
 *     summary: Crear nueva tarea
 *     description: Crea una nueva tarea en un proyecto específico.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - projectId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Implementar autenticación"
 *                 minLength: 3
 *               description:
 *                 type: string
 *                 example: "Implementar sistema de login con JWT"
 *               projectId:
 *                 type: integer
 *                 example: 1
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: "medium"
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, review, completed]
 *                 default: "pending"
 *                 example: "pending"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-15"
 *               assigneeId:
 *                 type: integer
 *                 description: ID del usuario asignado
 *                 example: 2
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 status:
 *                   type: string
 *                 createdBy:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *       400:
 *         description: Datos inválidos o proyecto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos en el proyecto
 *     x-middleware:
 *       - authMiddleware
 */
router.post('/:projectId', authMiddleware, rbacMiddleware(['admin', 'developer']), createTask);


/**
 * @swagger
 * /tasks/projects/{projectId}/tasks/{taskId}:
 *   get:
 *     summary: Obtener tareas por id de proyecto y tarea.
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task details
 */

router.get('/projects/:projectId/tasks/:taskId', authMiddleware, rbacMiddleware(['admin', 'developer', 'guest']), getTaskById);

/**
 * @swagger
 * /tasks/projects/{projectId}/tasks/{taskId}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated
 */

router.put('/projects/:projectId/tasks/:taskId', authMiddleware, rbacMiddleware(['admin', 'developer']), updateTask);

/**
 * @swagger
 * /tasks/projects/{projectId}/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Task deleted
 */

router.delete('/projects/:projectId/tasks/:taskId', authMiddleware, rbacMiddleware(['admin', 'developer']), deleteTask);

/**
 * @swagger
 * /tasks/projects/{projectId}/tasks:
 *   get:
 *     summary: Obtener tareas por proyecto
 *     description: Lista todas las tareas de un proyecto específico con filtros y paginación.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, review, completed]
 *         description: Filtrar por estado
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filtrar por prioridad
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: integer
 *         description: Filtrar por usuario asignado
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de tareas paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       dueDate:
 *                         type: string
 *                         format: date
 *                       assignee:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos en el proyecto
 *       404:
 *         description: Proyecto no encontrado
 *     x-middleware:
 *       - authMiddleware
 */

router.get('/projects/:projectId/tasks', authMiddleware, rbacMiddleware(['admin', 'developer', 'guest']), getTasksByProject);

/**
 * @swagger
 * /tasks/{projectId}/{taskId}/assign:
 *   post:
 *     summary: Assign a task to a user
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assigneeId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task assigned
 */

router.post('/:projectId/:taskId/assign', authMiddleware, rbacMiddleware(['admin', 'developer']), assignTask);

/**
 * @swagger
 * /tasks/{projectId}/{taskId}/status:
 *   post:
 *     summary: Cambiar estado de una tarea
 *     description: Actualiza el estado de una tarea y registra el cambio.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, review, completed]
 *                 example: "in_progress"
 *               comment:
 *                 type: string
 *                 example: "Iniciando desarrollo de la funcionalidad"
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 updatedBy:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *       400:
 *         description: Estado inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos para modificar la tarea
 *       404:
 *         description: Tarea no encontrada
 *     x-middleware:
 *       - authMiddleware
 */

router.patch('/:projectId/:taskId/status', authMiddleware, rbacMiddleware(['admin', 'developer']), changeStatus);

export default router;
