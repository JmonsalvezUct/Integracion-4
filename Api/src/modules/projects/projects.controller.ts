import type { Request, Response } from 'express';
import { projectService } from './projects.service.js';

export const projectController = {
createProject: async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body; // Solo name y description
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre del proyecto es requerido' });
    }

    const project = await projectService.createProject({ name, description });
    res.status(201).json(project);

  } catch (error) {
    console.error('Error in createProject:', error);
    res.status(500).json({ error: 'Error al crear el proyecto' });
  }
},

  getAllProjects: async (req: Request, res: Response) => {
    try {
      const projects = await projectService.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error('Error in getAllProjects:', error);
      res.status(500).json({ error: 'Error al obtener los proyectos' });
    }
  },

  getProjectById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID debe ser un número válido' });
      }

      const project = await projectService.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      res.json(project);
    } catch (error) {
      console.error('Error in getProjectById:', error);
      res.status(500).json({ error: 'Error al obtener el proyecto' });
    }
  },

  updateProject: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID debe ser un número válido' });
      }

      const { name, description, status } = req.body;
      
      const project = await projectService.updateProject(id, { name, description, status });
      
      if (!project) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      res.json(project);
    } catch (error) {
      console.error('Error in updateProject:', error);
      res.status(500).json({ error: 'Error al actualizar el proyecto' });
    }
  },

  deleteProject: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID debe ser un número válido' });
      }

      const deleted = await projectService.deleteProject(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteProject:', error);
      res.status(500).json({ error: 'Error al eliminar el proyecto' });
    }
  }
};