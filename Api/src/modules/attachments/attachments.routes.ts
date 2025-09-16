import { Router } from 'express';
import { attachmentController } from './attachments.controller.js';
import { upload } from '../../config/multer.js';

const router = Router();

// TDI-60: Subir archivo a una tarea
router.post('/:taskId', upload.single('file'), attachmentController.uploadAttachment);

// TDI-64: Obtener archivos de una tarea
router.get('/:taskId', attachmentController.getTaskAttachments);

// TDI-64: Descargar archivo
router.get('/:id/download', attachmentController.downloadAttachment);

// TDI-65: Eliminar archivo
router.delete('/:id', attachmentController.deleteAttachment);

export default router;