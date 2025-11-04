import { projectsService } from './projects.service.js';
import { CreateProjectSchema, UpdateProjectSchema } from './projects.validators.js';
export const createProject = async (req, res) => {
    const parse = CreateProjectSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
    if (!req.user?.id)
        return res.status(401).json({ error: 'No autorizado' });
    try {
        const project = await projectsService.createProject(parse.data, req.user.id);
        return res.status(201).json(project);
    }
    catch (e) {
        return res.status(500).json({ error: 'Error al crear el proyecto', details: e?.message });
    }
};
export const getProjects = async (req, res) => {
    try {
        const projects = await projectsService.getProjects();
        return res.json(projects);
    }
    catch {
        return res.status(500).json({ error: 'Error al obtener los proyectos' });
    }
};
export const getProjectById = async (req, res) => {
    try {
        const project = await projectsService.getProjectById(Number(req.params.projectId));
        if (!project)
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        return res.json(project);
    }
    catch {
        return res.status(500).json({ error: 'Error al obtener el proyecto' });
    }
};
export const updateProject = async (req, res) => {
    const parse = UpdateProjectSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
    try {
        const project = await projectsService.updateProject(Number(req.params.projectId), parse.data);
        return res.json(project);
    }
    catch {
        return res.status(500).json({ error: 'Error al actualizar el proyecto' });
    }
};
export const deleteProject = async (req, res) => {
    try {
        await projectsService.deleteProject(Number(req.params.projectId));
        return res.status(204).send();
    }
    catch {
        return res.status(500).json({ error: 'Error al eliminar el proyecto' });
    }
};
export const patchProject = async (req, res) => {
    const parse = UpdateProjectSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
    }
    try {
        const project = await projectsService.patchProject(Number(req.params.projectId), parse.data);
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }
        return res.json(project);
    }
    catch (e) {
        return res.status(500).json({ error: 'Error al actualizar parcialmente el proyecto' });
    }
};
export const getProjectsByUserId = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const projects = await projectsService.getProjectsByUserId(userId);
        return res.json(projects);
    }
    catch {
        return res.status(500).json({ error: 'Error al obtener los proyectos del usuario' });
    }
};
export const addUserToProject = async (req, res) => {
    try {
        const { projectId, userId, roleId } = req.body;
        const result = await projectsService.addUserToProject(projectId, userId, roleId);
        return res.status(201).json(result);
    }
    catch (e) {
        return res.status(500).json({ error: 'Error al agregar usuario al proyecto', details: e.message });
    }
};
export const updateUserRoleInProject = async (req, res) => {
    try {
        const { userProjectId, roleId } = req.body;
        const result = await projectsService.updateUserRoleInProject(userProjectId, roleId);
        return res.json(result);
    }
    catch (e) {
        return res.status(500).json({ error: 'Error al actualizar el rol del usuario', details: e.message });
    }
};
export const removeUserFromProject = async (req, res) => {
    try {
        const { userProjectId } = req.body;
        await projectsService.removeUserFromProject(userProjectId);
        return res.status(204).send();
    }
    catch (e) {
        return res.status(500).json({ error: 'Error al quitar usuario del proyecto', details: e.message });
    }
};
export const getProjectMembers = async (req, res) => {
    try {
        const projectId = Number(req.params.projectId);
        const members = await projectsService.getProjectMembers(projectId);
        return res.json(members);
    }
    catch (e) {
        return res.status(500).json({ error: 'Error al obtener los miembros del proyecto', details: e.message });
    }
};
//# sourceMappingURL=projects.controller.js.map