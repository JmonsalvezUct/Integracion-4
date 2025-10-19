import { Router } from 'express';
import { attachmentController } from './attachments.controller.js';
import { upload } from '../../config/multer.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { rbacMiddleware } from '../middlewares/rbac.middleware.js';

const router = Router();

// TDI-60: Subir archivo a una tarea
/**
 * @swagger
 * /attachments/{projectId}:
 *   post:
 *     summary: Subir archivo a una tarea
 *     description: Sube un archivo y lo asocia a una tarea específica
 *     tags: [Attachments]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo a subir
 *     responses:
 *       201:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Archivo subido exitosamente"
 *                 attachment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     taskId:
 *                       type: integer
 *                     filename:
 *                       type: string
 *                     originalName:
 *                       type: string
 *                     mimetype:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     path:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: ID de proyecto inválido o archivo no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error al subir el archivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post(
  '/:projectId',
  authMiddleware,
  rbacMiddleware(['admin', 'developer']),
  upload.single('file'),
  attachmentController.uploadAttachment
);

// TDI-64: Obtener archivos de una tarea
/**
 * @swagger
 * /attachments/{projectId}:
 *   get:
 *     summary: Obtener archivos de una tarea
 *     description: Retorna todos los archivos adjuntos de una tarea específica
 *     tags: [Attachments]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Lista de archivos adjuntos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   taskId:
 *                     type: integer
 *                   filename:
 *                     type: string
 *                   originalName:
 *                     type: string
 *                   mimetype:
 *                     type: string
 *                   size:
 *                     type: integer
 *                   path:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: ID de proyecto inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error al obtener los archivos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get(
  '/:projectId',
  authMiddleware, 
  rbacMiddleware(['admin', 'developer', 'viewer']),
  attachmentController.getTaskAttachments
);

// TDI-64: Descargar archivo
/**
 * @swagger
 * /attachments/{projectId}/{id}/download:
 *   get:
 *     summary: Descargar archivo
 *     description: Descarga un archivo específico por su ID
 *     tags: [Attachments]
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
 *         description: ID del archivo adjunto
 *     responses:
 *       200:
 *         description: Archivo descargado exitosamente
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: ID de archivo inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Archivo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error al descargar el archivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get(
  '/:projectId/:id/download',
  authMiddleware,
  rbacMiddleware(['admin', 'developer', 'viewer']),
  attachmentController.downloadAttachment
);

// TDI-65: Eliminar archivo
/**
 * @swagger
 * /attachments/{projectId}/{id}:
 *   delete:
 *     summary: Eliminar archivo
 *     description: Elimina un archivo específico por su ID (tanto el registro como el archivo físico)
 *     tags: [Attachments]
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
 *         description: ID del archivo adjunto
 *     responses:
 *       204:
 *         description: Archivo eliminado exitosamente
 *       400:
 *         description: ID de archivo inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Archivo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error al eliminar el archivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.delete(
  '/:projectId/:id',
  authMiddleware,
  rbacMiddleware(['admin']),
  attachmentController.deleteAttachment
);

export default router;