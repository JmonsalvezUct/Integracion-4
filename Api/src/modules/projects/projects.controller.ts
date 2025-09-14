import type { Request, Response } from 'express';
import { projectService } from './projects.service.js';

export const projectController = {
  // TDI-79: Crear proyecto
  createProject: async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'El nombre del proyecto es requerido' });
      }

      const project = await projectService.createProject({ name, description });
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el proyecto' });
    }
  },

  // TDI-80: Obtener todos los proyectos
  getAllProjects: async (req: Request, res: Response) => {
    try {
      const projects = await projectService.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los proyectos' });
    }
  },

  // TDI-81: Obtener proyecto por ID
  getProjectById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id!);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID debe ser un número válido' });
      }

      const project = await projectService.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el proyecto' });
    }
  },

  // TDI-82: Actualizar proyecto
  updateProject: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id!);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID debe ser un número válido' });
      }

      const { name, description } = req.body;
      
      const project = await projectService.updateProject(id, { name, description });
      
      if (!project) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el proyecto' });
    }
  },

  // TDI-83: Eliminar proyecto
  deleteProject: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id!);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID debe ser un número válido' });
      }

      const deleted = await projectService.deleteProject(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el proyecto' });
    }
  }
};