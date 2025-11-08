import { Router } from 'express';
import { attachmentController } from './attachments.controller.js';
import { upload } from '../../config/multer.js';
// Importar middlewares
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { rbacMiddleware } from '../../middlewares/rbac.middleware.js';
import { ProjectRoleType } from '@prisma/client'; // Importar enum si es necesario
const router = Router();
// TDI-60: Subir archivo a una tarea
// Ruta actualizada para incluir projectId, middlewares agregados
router.post('/projects/:projectId/tasks/:taskId', // Ruta modificada
authMiddleware, // Primero autentica
rbacMiddleware([ProjectRoleType.admin, ProjectRoleType.developer]), // Solo admin/dev pueden subir
upload.single('file'), // Middleware de Multer para subir archivo
attachmentController.uploadAttachment);
// TDI-64: Obtener archivos de una tarea
// Ruta actualizada para incluir projectId, middlewares agregados
router.get('/projects/:projectId/tasks/:taskId', // Ruta modificada
authMiddleware, // Primero autentica
rbacMiddleware([ProjectRoleType.admin, ProjectRoleType.developer, ProjectRoleType.guest]), // Todos los roles pueden ver la lista
attachmentController.getTaskAttachments);
// TDI-64: Descargar archivo
// Ruta actualizada para incluir projectId, middlewares agregados
router.get('/projects/:projectId/attachments/:id/download', // Ruta modificada
authMiddleware, // Primero autentica
rbacMiddleware([ProjectRoleType.admin, ProjectRoleType.developer, ProjectRoleType.guest]), // Todos los roles pueden descargar
attachmentController.downloadAttachment);
// TDI-65: Eliminar archivo
// Ruta actualizada para incluir projectId, middlewares agregados
router.delete('/projects/:projectId/attachments/:id', // Ruta modificada
authMiddleware, // Primero autentica
rbacMiddleware([ProjectRoleType.admin, ProjectRoleType.developer]), // Solo admin/dev pueden eliminar
attachmentController.deleteAttachment);
export default router;
//# sourceMappingURL=attachments.routes.js.map