import type { Request, Response } from 'express';
import { tasksService } from './tasks.service.js';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  AssignTaskSchema,
  ChangeStatusSchema,
  ExportTasksSchema, // <-- Importar Schema
} from './tasks.validators.js';

export const createTask = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }


    const parse = CreateTaskSchema.safeParse({
      ...req.body,
      projectId,
    });

    if (!parse.success) {
      return res
        .status(400)
        .json({ error: "VALIDATION_ERROR", details: parse.error.flatten() });
    }

    const task = await tasksService.createTask({ ...parse.data, userId });

    return res.status(201).json(task);
  } catch (error: any) {
    console.error("Error al crear tarea:", error);
    return res.status(500).json({ error: "Error al crear la tarea" });
  }
};


export const getTasks = async (_req: Request, res: Response) => {
  try {
    const tasks = await tasksService.getTasks();
    return res.json(tasks);
  } catch {
    return res.status(500).json({ error: 'Error al obtener las tareas' });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const task = await tasksService.getTaskById(Number(req.params.taskId));
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    return res.json(task);
  } catch {
    return res.status(500).json({ error: 'Error al obtener la tarea' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const parse = UpdateTaskSchema.safeParse(req.body);
  if (!parse.success) {
    return res
      .status(400)
      .json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
  }
  const userId = (req as any).user?.id;

  try {
    const task = await tasksService.updateTask(Number(req.params.taskId), { ...parse.data, userId });
    return res.json(task);
  } catch {
    return res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  try {
    await tasksService.deleteTask(Number(req.params.taskId), userId);
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
};

export const getTasksByProject = async (req: Request, res: Response) => {
  try {

    const projectId = Number(req.params.projectId);

    // NOTA: Esta función actualmente no implementa los filtros que describe tu Swagger.
    // La nueva función de exportar SÍ los implementa.
    const tasks = await tasksService.getTasksByProject(projectId);
    return res.json(tasks);
  } catch {
    return res
      .status(500)
      .json({ error: 'Error al obtener las tareas del proyecto' });
  }
};

export const assignTask = async (req: Request, res: Response) => {
  const parse = AssignTaskSchema.safeParse(req.body);
  if (!parse.success) {
    return res
      .status(400)
      .json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
  }
  const userId = (req as any).user?.id;
  try {
    const updated = await tasksService.assignTask(Number(req.params.taskId), { ...parse.data, userId });
    return res.json(updated);
  } catch {
    return res.status(500).json({ error: 'Error al asignar la tarea' });
  }
};

export const changeStatus = async (req: Request, res: Response) => {
  const parse = ChangeStatusSchema.safeParse(req.body);
  if (!parse.success) {
    return res
      .status(400)
      .json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
  }
  const userId = (req as any).user?.id;
  try {
    const updated = await tasksService.changeStatus(Number(req.params.taskId), { ...parse.data, userId });
    return res.json(updated);
  } catch {
    return res.status(500).json({ error: 'Error al cambiar el estado de la tarea' });
  }
};

// --- NUEVO CÓDIGO AÑADIDO ---
export const exportTasks = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);

    // Validamos el body
    const parse = ExportTasksSchema.safeParse(req.body);
    if (!parse.success) {
      return res
        .status(400)
        .json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
    }

    // Ni 'taskIds' ni 'filters' están presentes
    if (!parse.data.taskIds && !parse.data.filters) {
        // Podrías default a exportar todo o devolver un error.
        // Por ahora, asumimos que si ambos están vacíos, se exporta todo (el servicio lo maneja)
    }

    // Llamamos al servicio de exportación
    const { buffer, mimeType, fileName } = await tasksService.exportTasks(
      projectId,
      parse.data
    );

    // Configuramos los headers para la descarga
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Enviamos el buffer del archivo
    return res.send(buffer);

  } catch (error: any) {
    if (error.message.includes("No se encontraron tareas")) {
         return res.status(404).json({ error: error.message });
    }
    console.error("Error al exportar tareas:", error);
    return res.status(500).json({ error: 'Error al exportar las tareas' });
  }
};
// --- FIN DE CÓDIGO AÑADIDO ---