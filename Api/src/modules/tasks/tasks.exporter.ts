// CAMBIO 1: Se usa "import type" para FullTask
import type { FullTask } from './tasks.repository.js';
import * as csv from 'fast-csv';
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

// --- Funciones auxiliares para formatear datos ---

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('es-CL'); // Formato local
};

const formatUser = (user: FullTask['assignee'] | FullTask['creator']): string => {
  return user?.name || 'N/A';
};

const formatTags = (tags: FullTask['tags']): string => {
  if (!tags || tags.length === 0) return 'N/A';
  return tags.map(t => t.tag.name).join(', ');
};

const formatAttachments = (attachments: FullTask['attachments']): string => {
  if (!attachments || attachments.length === 0) return 'N/A';
  return attachments.map(a => a.originalName).join(', ');
};

const formatTotalTime = (times: FullTask['times']): number => {
  if (!times || times.length === 0) return 0;
  return times.reduce((acc, t) => acc + t.durationMinutes, 0);
};

// --- Generador de CSV ---

export const generateCsv = (tasks: FullTask[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const data: any[] = [];
    
    tasks.forEach(task => {
      data.push({
        ID: task.id,
        Titulo: task.title,
        Descripcion: task.description || '',
        Proyecto: task.project.name,
        Sprint: task.sprint?.name || 'N/A',
        Estado: task.status,
        Prioridad: task.priority,
        Creador: formatUser(task.creator),
        Asignado: formatUser(task.assignee),
        'Fecha Creacion': formatDate(task.createdAt),
        'Fecha Vencimiento': formatDate(task.dueDate),
        Etiquetas: formatTags(task.tags),
        Adjuntos: formatAttachments(task.attachments),
        'Minutos Registrados': formatTotalTime(task.times),
        'ID Proyecto': task.projectId,
        'ID Creador': task.creatorId,
        'ID Asignado': task.assigneeId || 'N/A',
        'ID Sprint': task.sprintId || 'N/A',
      });
    });

    const csvStream = csv.format({ headers: true });
    const chunks: Buffer[] = [];

    csvStream.on('data', (chunk: Buffer) => chunks.push(chunk));
    csvStream.on('end', () => resolve(Buffer.concat(chunks)));
    csvStream.on('error', (err: Error) => reject(err));

    data.forEach(row => csvStream.write(row));
    csvStream.end();
  });
};

// --- Generador de PDF ---

export const generatePdf = (tasks: FullTask[]): Promise<Buffer> => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 72, right: 72 },
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // --- Contenido del PDF ---
    doc.fontSize(18).text('Reporte de Tareas', { align: 'center' });
    doc.fontSize(12).text(`Generado el: ${formatDate(new Date())}`, { align: 'center' });
    doc.moveDown(2);

    tasks.forEach((task, index) => {
      if (index > 0) {
        doc.addPage();
      }

      doc.fontSize(16).fillColor('black').text(`Tarea: ${task.title} (ID: ${task.id})`, { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(10).fillColor('gray').text(`Proyecto: ${task.project.name} | Sprint: ${task.sprint?.name || 'N/A'}`);
      doc.moveDown(1);

      if (task.description) {
        doc.fontSize(12).fillColor('black').text('Descripción:', { continued: true }).fillColor('gray').text(` ${task.description || 'Sin descripción'}`);
        doc.moveDown(1);
      }
      
      const startY = doc.y;
      const leftColX = doc.page.margins.left;
      const rightColX = doc.page.width / 2 + 20;

      // --- CAMBIO 2: Se corrigen las llamadas a doc.text() ---
      // La sintaxis correcta es: text(texto, x, y, opciones)
      
      // Columna Izquierda
      doc.fontSize(10).fillColor('black').text('Estado:', leftColX, startY, { continued: true }).fillColor('gray').text(` ${task.status}`);
      // Para las siguientes, 'undefined' en 'y' usa la posición Y actual
      doc.text('Prioridad:', leftColX, undefined, { continued: true }).fillColor('gray').text(` ${task.priority}`);
      doc.text('Creador:', leftColX, undefined, { continued: true }).fillColor('gray').text(` ${formatUser(task.creator)}`);
      doc.text('Asignado:', leftColX, undefined, { continued: true }).fillColor('gray').text(` ${formatUser(task.assignee)}`);

      // Columna Derecha
      doc.fontSize(10).fillColor('black').text('Fecha Creación:', rightColX, startY, { continued: true }).fillColor('gray').text(` ${formatDate(task.createdAt)}`);
      doc.text('Fecha Vencimiento:', rightColX, undefined, { continued: true }).fillColor('gray').text(` ${formatDate(task.dueDate)}`);
      doc.text('Etiquetas:', rightColX, undefined, { continued: true }).fillColor('gray').text(` ${formatTags(task.tags)}`);
      // --- FIN DEL CAMBIO 2 ---

      doc.moveDown(2);
      const detailsEndY = doc.y; 

      doc.y = detailsEndY;

      // Adjuntos
      if (task.attachments.length > 0) {
        doc.fontSize(12).fillColor('black').text('Adjuntos:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('gray');
        task.attachments.forEach(att => doc.text(`- ${att.originalName} (${att.mimetype})`));
        doc.moveDown(1);
      }
      
      // Tiempos Registrados
      if (task.times.length > 0) {
        doc.fontSize(12).fillColor('black').text('Tiempos Registrados:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('gray');
        task.times.forEach(time => {
          doc.text(`- ${time.durationMinutes} min - ${formatUser(time.user)} (${formatDate(time.date)})`);
        });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('black').text(`Total: ${formatTotalTime(task.times)} minutos`);
        doc.moveDown(1);
      }

      // Historial de Cambios
      if (task.history.length > 0) {
        doc.fontSize(12).fillColor('black').text('Historial de Cambios:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('gray');
        task.history.slice(0, 10).forEach(hist => {
          doc.text(`- [${hist.action}] ${hist.description} - ${formatUser(hist.user)} (${formatDate(hist.date)})`);
        });
        if (task.history.length > 10) {
          doc.text('... y más cambios no mostrados.');
        }
        doc.moveDown(1);
      }

    });

    doc.end();
  });
};