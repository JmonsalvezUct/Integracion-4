import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const projectService = {
  createProject: async (data: { 
    name: string; 
    description?: string;
  }) => {
    try {
      const project = await prisma.project.create({
        data: {
          name: data.name,
          description: data.description || '',
          // SOLO name y description - son los únicos que sabemos que existen
        },
      });
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Error al crear el proyecto');
    }
  },

  getAllProjects: async () => {
    try {
      const projects = await prisma.project.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return projects;
    } catch (error) {
      console.error('Error getting projects:', error);
      throw new Error('Error al obtener los proyectos');
    }
  },

  getProjectById: async (id: number) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id },
      });
      return project;
    } catch (error) {
      console.error('Error getting project by id:', error);
      throw new Error('Error al obtener el proyecto');
    }
  },

  updateProject: async (id: number, data: { 
    name?: string; 
    description?: string;
  }) => {
    try {
      const existingProject = await prisma.project.findUnique({
        where: { id },
      });

      if (!existingProject) {
        return null;
      }

      const project = await prisma.project.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        },
      });
      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Error al actualizar el proyecto');
    }
  },

  deleteProject: async (id: number) => {
    try {
      const existingProject = await prisma.project.findUnique({
        where: { id },
      });

      if (!existingProject) {
        return false;
      }

      await prisma.project.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Error al eliminar el proyecto');
    }
  }
};