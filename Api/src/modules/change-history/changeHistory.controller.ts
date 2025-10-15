    import type { Request, Response } from "express";
    import { changeHistoryService } from "./changeHistory.service.js";

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

    // 🟣 Obtener historial de cambios por proyecto
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
    };
