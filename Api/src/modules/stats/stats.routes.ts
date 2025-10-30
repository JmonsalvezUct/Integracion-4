import { Router } from 'express';
import { getUserStats } from './stats.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { rbacMiddleware } from '../../middlewares/rbac.middleware.js';
import { ProjectRoleType } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /stats/project/{projectId}/user-stats:
 *   get:
 *     summary: Obtener estadísticas de desempeño individual de un usuario
 *     description: Retorna estadísticas detalladas incluyendo tareas completadas, burndown, tiempo trabajado, etc.
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID del usuario del que se quieren obtener estadísticas
 *               from:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio (YYYY-MM-DD)
 *               to:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Estadísticas del usuario
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos en el proyecto
 *     x-middleware:
 *       - authMiddleware
 *       - rbacMiddleware
 */
router.post(
  '/project/:projectId/user-stats',
  authMiddleware,
  rbacMiddleware([ProjectRoleType.admin, ProjectRoleType.developer, ProjectRoleType.guest]),
  getUserStats
);

export default router;
