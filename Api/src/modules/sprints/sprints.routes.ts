import { Router } from "express";
import {
  createSprint,
  getSprintsByProjectId,
  getSprintById,
  updateSprint,
  deleteSprint,
  finalizeSprint,
} from "./sprints.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = Router({ mergeParams: true });
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Sprints
 *   description: Gestión de Sprints
 */

/**
 * @swagger
 * /projects/{projectId}/sprints:
 *   post:
 *     summary: Crear un sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Sprint creado exitosamente
 *       400:
 *         description: Error de solicitud
 *       401:
 *         description: No autorizado
 */
router.post("/", roleMiddleware(["admin"]), createSprint);

/**
 * @swagger
 * /projects/{projectId}/sprints/{sprintId}:
 *   put:
 *     summary: Actualizar sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: sprintId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Sprint actualizado
 *       404:
 *         description: Sprint no encontrado
 */
router.put("/:sprintId", roleMiddleware(["admin"]), updateSprint);

/**
 * @swagger
 * /projects/{projectId}/sprints/{sprintId}/finalize:
 *   patch:
 *     summary: Finalizar sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: sprintId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Sprint finalizado
 *       404:
 *         description: Sprint no encontrado
 */
router.patch("/:sprintId/finalize", roleMiddleware(["admin"]), finalizeSprint);

/**
 * @swagger
 * /projects/{projectId}/sprints/{sprintId}:
 *   delete:
 *     summary: Eliminar sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: sprintId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Sprint eliminado
 *       404:
 *         description: Sprint no encontrado
 */
router.delete("/:sprintId", roleMiddleware(["admin"]), deleteSprint);

/**
 * @swagger
 * /projects/{projectId}/sprints:
 *   get:
 *     summary: Obtener todos los sprints del proyecto
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de sprints
 */
router.get("/", getSprintsByProjectId);

/**
 * @swagger
 * /projects/{projectId}/sprints/{sprintId}:
 *   get:
 *     summary: Obtener sprint por ID
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: sprintId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Sprint encontrado
 *       404:
 *         description: Sprint no encontrado
 */
router.get("/:sprintId", getSprintById);

export default router;
