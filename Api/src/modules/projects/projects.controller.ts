import type { Request, Response } from 'express';
import { projectsService } from './projects.service.js';
import { CreateProjectSchema, UpdateProjectSchema } from './projects.validators.js';

export const createProject = async (req: Request, res: Response) => {
  const parse = CreateProjectSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
  try {
    const project = await projectsService.createProject(parse.data);
    return res.status(201).json(project);
  } catch (e: any) {
    return res.status(500).json({ error: 'Error al crear el proyecto' });
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
    const project = await projectsService.getProjectById(Number(req.params.id));
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
    const project = await projectsService.updateProject(Number(req.params.id), parse.data);
    return res.json(project);
  } catch {
    return res.status(500).json({ error: 'Error al actualizar el proyecto' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    await projectsService.deleteProject(Number(req.params.id));
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Error al eliminar el proyecto' });
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

export const getUserRolesInProjects = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const roles = await projectsService.getUserRolesInProjects(userId);
    return res.json(roles);
  } catch {
    return res.status(500).json({ error: 'Error al obtener los roles del usuario en proyectos' });
  }
};
