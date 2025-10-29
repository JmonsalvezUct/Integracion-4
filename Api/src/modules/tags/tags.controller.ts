    import type { Request, Response } from "express";
    import { tagsService } from "./tags.service.js";


    export const createTag = async (req: Request, res: Response) => {
    try {
        const { projectId, name, color } = req.body;
        const tag = await tagsService.createTag(projectId, name, color);
        res.status(201).json(tag);
    } catch (error: any) {
        console.error("Error al crear etiqueta:", error);
        res.status(500).json({ message: "Error al crear etiqueta", error: error.message });
    }
    };

    export const getTagsByProject = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const tags = await tagsService.getTagsByProject(projectId);
        res.json(tags);
    } catch (error: any) {
        console.error("Error al obtener etiquetas:", error);
        res.status(500).json({ message: "Error al obtener etiquetas", error: error.message });
    }
    };


    export const assignTagToTask = async (req: Request, res: Response) => {
    try {
        const { taskId, tagId } = req.body;
        const result = await tagsService.assignTagToTask(taskId, tagId);
        res.status(201).json(result);
    } catch (error: any) {
        console.error("Error al asignar etiqueta:", error);
        res.status(500).json({ message: "Error al asignar etiqueta", error: error.message });
    }
    };


    export const removeTagFromTask = async (req: Request, res: Response) => {
    try {
        const taskId = Number(req.params.taskId);
        const tagId = Number(req.params.tagId);
        const result = await tagsService.removeTagFromTask(taskId, tagId);
        res.json({ message: "Etiqueta eliminada correctamente", result });
    } catch (error: any) {
        console.error("Error al eliminar etiqueta:", error);
        res.status(500).json({ message: "Error al eliminar etiqueta", error: error.message });
    }
    };


    export const getTagsByTask = async (req: Request, res: Response) => {
    try {
        const taskId = Number(req.params.taskId);
        const tags = await tagsService.getTagsByTask(taskId);
        res.json(tags);
    } catch (error: any) {
        console.error("Error al obtener etiquetas de tarea:", error);
        res.status(500).json({ message: "Error al obtener etiquetas de tarea", error: error.message });
    }
    };
