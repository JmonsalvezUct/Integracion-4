    import type { Request, Response } from "express";
    import { changeHistoryService } from "./changeHistory.service.js";
    import { prisma } from "../../app/loaders/prisma.js";

    export const changeHistoryController = {

    async getByTask(req: Request, res: Response) {
        try {
        const taskId = Number(req.params.taskId);

        if (isNaN(taskId)) {
            return res.status(400).json({ message: "El ID de la tarea no es válido" });
        }

        const history = await changeHistoryService.getHistoryByTask(taskId);

        if (!history || history.length === 0) {
            return res.status(404).json({ message: "No se encontró historial para esta tarea" });
        }

        res.status(200).json(history);
        } catch (error) {
        console.error("Error al obtener historial de cambios:", error);
        res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    

    async getHistoryByProject(req: Request, res: Response) {
        try {
        const projectId = Number(req.params.projectId);

        if (isNaN(projectId)) {
            return res.status(400).json({ message: "El ID del proyecto no es válido" });
        }

        const history = await changeHistoryService.getHistoryByProject(projectId);

        if (!history || history.length === 0) {
            return res.status(404).json({ message: "No se encontró historial para este proyecto" });
        }

        res.status(200).json(history);
        } catch (error) {
        console.error("Error al obtener historial por proyecto:", error);
        res.status(500).json({ message: "Error interno del servidor" });
        }
    },


    async getByTaskInProject(req: Request, res: Response) {
        try {
            const projectId = Number(req.params.projectId);
            const taskId = Number(req.params.taskId);

            if (isNaN(projectId) || isNaN(taskId)) {
            return res.status(400).json({ message: "IDs inválidos" });
            }

    
            const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: { projectId: true },
            });

            if (!task) {
            return res.status(404).json({ message: "Tarea no encontrada" });
            }

            if (task.projectId !== projectId) {
            return res.status(403).json({
                message: `La tarea ${taskId} no pertenece al proyecto ${projectId}`,
            });
            }

            const history = await changeHistoryService.getHistoryByTask(taskId);

            if (!history || history.length === 0) {
            return res.status(404).json({ message: "No hay historial para esta tarea" });
            }

            res.status(200).json(history);
        } catch (error) {
            console.error("Error al obtener historial de tarea por proyecto:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
        }

    };
