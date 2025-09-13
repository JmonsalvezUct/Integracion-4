import prisma from '../../app/prisma';

export const attachmentService = {
  // Crear attachment (TDI-60)
  async createAttachment(taskId: number, fileData: { 
    filename: string; 
    originalName: string; 
    mimetype: string; 
    size: number; 
    path: string; 
  }) {
    return await prisma.attachment.create({
      data: {
        taskId,
        filename: fileData.filename,
        originalName: fileData.originalName,
        mimetype: fileData.mimetype,
        size: fileData.size,
        path: fileData.path
      }
    });
  },

  // Obtener attachments por task ID (TDI-64)
  async getAttachmentsByTaskId(taskId: number) {
    return await prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Obtener attachment por ID (TDI-64)
  async getAttachmentById(id: number) {
    return await prisma.attachment.findUnique({
      where: { id }
    });
  },

  // Eliminar attachment (TDI-65)
  async deleteAttachment(id: number) {
    return await prisma.attachment.delete({
      where: { id }
    });
  }
};