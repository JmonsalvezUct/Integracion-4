import { sprintsService } from "./sprints.service.js";
import { createSprintSchema, updateSprintSchema } from "./sprints.validators.js";
export const createSprint = async (req, res) => {
    try {
        const projectId = Number(req.params.projectId);
        const data = createSprintSchema.parse(req.body);
        const sprint = await sprintsService.createSprint(projectId, data);
        res.status(201).json(sprint);
    }
    catch (error) {
        res.status(400).json({ message: "Error al crear sprint", error: error.message });
    }
};
export const getSprintsByProjectId = async (req, res) => {
    try {
        const projectId = Number(req.params.projectId);
        const sprints = await sprintsService.getSprintsByProjectId(projectId);
        res.json(sprints);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener sprints", error: error.message });
    }
};
export const getSprintById = async (req, res) => {
    try {
        const sprintId = Number(req.params.sprintId);
        const sprint = await sprintsService.getSprintById(sprintId);
        res.json(sprint);
    }
    catch (error) {
        res.status(404).json({ message: "Sprint no encontrado", error: error.message });
    }
};
export const updateSprint = async (req, res) => {
    try {
        const sprintId = Number(req.params.sprintId);
        const data = updateSprintSchema.parse(req.body);
        const updated = await sprintsService.updateSprint(sprintId, data);
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ message: "Error al actualizar sprint", error: error.message });
    }
};
export const deleteSprint = async (req, res) => {
    try {
        const sprintId = Number(req.params.sprintId);
        await sprintsService.deleteSprint(sprintId);
        res.status(204).end();
    }
    catch (error) {
        res.status(400).json({ message: "Error al eliminar sprint", error: error.message });
    }
};
export const finalizeSprint = async (req, res) => {
    try {
        const sprintId = Number(req.params.sprintId);
        const sprint = await sprintsService.finalizeSprint(sprintId);
        res.json(sprint);
    }
    catch (error) {
        res.status(400).json({ message: "Error al finalizar sprint", error: error.message });
    }
};
//# sourceMappingURL=sprints.controller.js.map