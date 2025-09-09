import { Request, Response } from 'express';
import { projectService } from './projects.service';

export const projectController = {
  // Crear proyecto (TDI-79)
  createProject: async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'El nombre del proyecto es requerido' });
      }

      const project = await projectService.createProject({ name, description });
      res.status(201).json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Error al crear el proyecto' });
    }
  },

  // Obtener todos los proyectos (TDI-80)
  getAllProjects: async (req: Request, res: Response) => {
    try {
      const projects = await projectService.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error('Error getting projects:', error);
      res.status(500).json({ error: 'Error al obtener los proyectos' });
    }
  },

  // Obtener proyecto por ID (TDI-81)
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
      console.error('Error getting project:', error);
      res.status(500).json({ error: 'Error al obtener el proyecto' });
    }
  },

  // Actualizar proyecto (TDI-82)
  updateProject: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID debe ser un número válido' });
      }

      const { name, description } = req.body;
      
      const project = await projectService.updateProject(id, { name, description });
      res.json(project);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Error al actualizar el proyecto' });
    }
  },

  // Eliminar proyecto (TDI-83)
  deleteProject: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID debe ser un número válido' });
      }

      await projectService.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Error al eliminar el proyecto' });
    }
  },
};