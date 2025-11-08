import { Router } from "express";
import {
  createInvitation,
  listProjectInvitations,
  listMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "./invitations.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: Endpoints para la gestión de invitaciones a proyectos
 */

/**
 * @swagger
 * /projects/{projectId}/invitations:
 *   post:
 *     summary: Crear una invitación a un usuario para un proyecto
 *     tags: [Invitations]
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
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@example.com
 *               role:
 *                 type: string
 *                 example: "member"
 *     responses:
 *       201:
 *         description: Invitación creada correctamente
 *       400:
 *         description: Error en los datos enviados o usuario inexistente
 *       401:
 *         description: No autorizado
 */
router.post("/projects/:projectId/invitations", authMiddleware, createInvitation);

/**
 * @swagger
 * /projects/{projectId}/invitations:
 *   get:
 *     summary: Listar todas las invitaciones de un proyecto
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Lista de invitaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invitation'
 *       401:
 *         description: No autorizado
 */
router.get("/projects/:projectId/invitations", authMiddleware, listProjectInvitations);

/**
 * @swagger
 * /invitations/me:
 *   get:
 *     summary: Listar las invitaciones recibidas por el usuario autenticado
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de invitaciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invitation'
 *       401:
 *         description: No autorizado
 */
router.get("/me", authMiddleware, listMyInvitations);

/**
 * @swagger
 * /invitations/{id}/accept:
 *   post:
 *     summary: Aceptar una invitación
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la invitación
 *     responses:
 *       200:
 *         description: Invitación aceptada correctamente
 *       404:
 *         description: Invitación no encontrada
 *       401:
 *         description: No autorizado
 */
router.post("/:id/accept", authMiddleware, acceptInvitation);

/**
 * @swagger
 * /invitations/{id}/reject:
 *   post:
 *     summary: Rechazar una invitación
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la invitación
 *     responses:
 *       200:
 *         description: Invitación rechazada correctamente
 *       404:
 *         description: Invitación no encontrada
 *       401:
 *         description: No autorizado
 */
router.post("/:id/reject", authMiddleware, rejectInvitation);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Invitation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           example: usuario@example.com
 *         projectId:
 *           type: integer
 *           example: 10
 *         role:
 *           type: string
 *           example: "member"
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *           example: "pending"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-08T12:34:56.789Z"
 */
