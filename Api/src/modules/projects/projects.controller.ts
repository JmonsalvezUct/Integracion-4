import type { Request, Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';
import { projectsService } from './projects.service.js';
import { CreateProjectSchema, UpdateProjectSchema } from './projects.validators.js';

export const createProject = async (req: AuthRequest, res: Response) => {
  const parse = CreateProjectSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
  if (!req.user?.id) return res.status(401).json({ error: 'No autorizado' });
  try {
    const project = await projectsService.createProject(parse.data, req.user.id);
    return res.status(201).json(project);
  } catch (e: any) {
    return res.status(500).json({ error: 'Error al crear el proyecto', details: e?.message });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await projectsService.getProjects();
    return res.json(projects);
  } catch {
    return res.status(500).json({ error: 'Error al obtener los proyectos' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const project = await projectsService.getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    return res.json(project);
  } catch {
    return res.status(500).json({ error: 'Error al obtener el proyecto' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const parse = UpdateProjectSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
  try {
    const project = await projectsService.updateProject(Number(req.params.projectId), parse.data);
    return res.json(project);
  } catch {
    return res.status(500).json({ error: 'Error al actualizar el proyecto' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    await projectsService.deleteProject(Number(req.params.projectId));
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Error al eliminar el proyecto' });
  }
};

export const patchProject = async (req: Request, res: Response) => {
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
  } catch (e) {
    return res.status(500).json({ error: 'Error al actualizar parcialmente el proyecto' });
  }
};

export const getProjectsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const projects = await projectsService.getProjectsByUserId(userId);
    return res.json(projects);
  } catch {
    return res.status(500).json({ error: 'Error al obtener los proyectos del usuario' });
  }
};

export const addUserToProject = async (req: Request, res: Response) => {
  try {
    const { projectId, userId, roleId } = req.body;
    const result = await projectsService.addUserToProject(projectId, userId, roleId);
    return res.status(201).json(result);
  } catch (e: any) {
    return res.status(500).json({ error: 'Error al agregar usuario al proyecto', details: e.message });
  }
};

export const updateUserRoleInProject = async (req: Request, res: Response) => {
  try {
    const { userProjectId, role } = req.body;
    const result = await projectsService.updateUserRoleInProject(userProjectId, role);
    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ error: 'Error al actualizar el rol del usuario', details: e.message });
  }
};

export const removeUserFromProject = async (req: Request, res: Response) => {
  try {
    const { userProjectId } = req.body;
    await projectsService.removeUserFromProject(userProjectId);
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: 'Error al quitar usuario del proyecto', details: e.message });
  }
};

export const getProjectMembers = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const members = await projectsService.getProjectMembers(projectId);
    return res.json(members);
  } catch (e: any) {
    return res.status(500).json({ error: 'Error al obtener los miembros del proyecto', details: e.message });
  }
};
