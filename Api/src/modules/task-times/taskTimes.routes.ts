import { Router } from 'express';
import { taskTimesController } from './taskTimes.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { rbacMiddleware } from '../../middlewares/rbac.middleware.js';


const router = Router();

/**
 * @swagger
 * /task-times/projects/{projectId}/tasks/{taskId}/times:
 *   post:
 *     summary: Registrar tiempo en una tarea
 *     description: Crea un nuevo registro de tiempo para una tarea específica dentro de un proyecto
 *     tags: [TaskTimes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto
 *       - in: path
 *         name: taskId
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
 *               - durationMinutes
 *               - date
 *             properties:
 *               durationMinutes:
 *                 type: integer
 *                 description: Duración en minutos
 *                 example: 120
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora del registro
 *                 example: "2024-01-15T10:30:00Z"
 *               description:
 *                 type: string
 *                 description: Descripción del trabajo realizado
 *                 example: "Desarrollo de funcionalidad de login"
 *     responses:
 *       201:
 *         description: Tiempo registrado exitosamente
 *       401:
 *         description: No autorizado
 */
router.post('/projects/:projectId/tasks/:taskId/times', authMiddleware, rbacMiddleware(['admin','developer']), taskTimesController.createForTask);


/**
 * @swagger
* /task-times/projects/{projectId}/tasks/{taskId}/times:
 *   get:
 *     summary: Obtener tiempos registrados de una tarea
 *     description: Recupera todos los registros de tiempo asociados a una tarea específica
 *     tags: [TaskTimes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Lista de tiempos registrados en la tarea
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   durationMinutes:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   description:
 *                     type: string
 *                   userId:
 *                     type: integer
 *                   taskId:
 *                     type: integer
 *       401:
 *         description: No autorizado
 */
router.get('/projects/:projectId/tasks/:taskId/times', authMiddleware, rbacMiddleware(['admin','developer', 'guest']), taskTimesController.getByTask);


/**
 * @swagger
 * /task-times/projects/{projectId}/users/{userId}/times:
*   get:
 *     summary: Obtener tiempos registrados por usuario en un proyecto
 *     description: Recupera todos los registros de tiempo de un usuario específico dentro de un proyecto
 *     tags: [TaskTimes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de tiempos registrados por el usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   durationMinutes:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   description:
 *                     type: string
 *                   taskId:
 *                     type: integer
 *                   taskName:
 *                     type: string
 *       401:
 *         description: No autorizado
 */
router.get('/projects/:projectId/users/:userId/times', authMiddleware, rbacMiddleware(['admin','developer', 'guest']), taskTimesController.getByUser);


/**
 * @swagger
 * /task-times/projects/{projectId}/times/{id}:
 *   delete:
 *     summary: Eliminar un registro de tiempo
 *     description: Elimina un registro de tiempo específico de un proyecto
 *     tags: [TaskTimes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro de tiempo
 *     responses:
 *       200:
 *         description: Registro eliminado exitosamente
 *       401:
 *         description: No autorizado
 */
router.delete('/projects/:projectId/times/:id', authMiddleware, rbacMiddleware(['admin','developer', 'guest']), taskTimesController.deleteEntry);

export default router;
