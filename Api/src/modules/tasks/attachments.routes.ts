import { Router } from 'express';
import { attachmentController } from './attachments.controller';
import { upload } from '../../config/multer';

const router = Router();

// TDI-60: Subir archivo a una tarea
router.post('/:taskId/attachments', upload.single('file'), attachmentController.uploadAttachment);

// TDI-64: Obtener archivos de una tarea
router.get('/:taskId/attachments', attachmentController.getTaskAttachments);

// TDI-64: Descargar archivo
router.get('/attachments/:id/download', attachmentController.downloadAttachment);

// TDI-65: Eliminar archivo
router.delete('/attachments/:id', attachmentController.deleteAttachment);

export default router;