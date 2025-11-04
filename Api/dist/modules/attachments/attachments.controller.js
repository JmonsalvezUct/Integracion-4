import fs from 'fs';
import path from 'path';
import { attachmentService } from './attachments.service.js';
export const attachmentController = {
    // Subir archivo (TDI-60 + TDI-61 + TDI-62 + TDI-63)
    uploadAttachment: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
            }
            const taskId = parseInt(req.params.taskId);
            if (isNaN(taskId)) {
                // Eliminar el archivo subido si hay error
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ error: 'ID de tarea inválido' });
            }
            const attachment = await attachmentService.createAttachment(taskId, {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path
            });
            res.status(201).json({
                message: 'Archivo subido exitosamente',
                attachment
            });
        }
        catch (error) {
            // Eliminar archivo en caso de error
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({
                error: 'Error al subir el archivo',
                message: error.message // ← Agrega esto
            });
        }
    },
    // Obtener archivos de una tarea (TDI-64)
    getTaskAttachments: async (req, res) => {
        try {
            const taskId = parseInt(req.params.taskId);
            if (isNaN(taskId)) {
                return res.status(400).json({ error: 'ID de tarea inválido' });
            }
            const attachments = await attachmentService.getAttachmentsByTaskId(taskId);
            res.json(attachments);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener los archivos' });
        }
    },
    // Descargar archivo (TDI-64)
    downloadAttachment: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID de archivo inválido' });
            }
            const attachment = await attachmentService.getAttachmentById(id);
            if (!attachment) {
                return res.status(404).json({ error: 'Archivo no encontrado' });
            }
            if (!fs.existsSync(attachment.path)) {
                return res.status(404).json({ error: 'El archivo no existe en el servidor' });
            }
            res.download(attachment.path, attachment.originalName);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al descargar el archivo' });
        }
    },
    // Eliminar archivo (TDI-65)
    deleteAttachment: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID de archivo inválido' });
            }
            const attachment = await attachmentService.getAttachmentById(id);
            if (!attachment) {
                return res.status(404).json({ error: 'Archivo no encontrado' });
            }
            // Eliminar archivo físico
            if (fs.existsSync(attachment.path)) {
                fs.unlinkSync(attachment.path);
            }
            // Eliminar registro de la base de datos
            await attachmentService.deleteAttachment(id);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: 'Error al eliminar el archivo' });
        }
    }
};
//# sourceMappingURL=attachments.controller.js.map