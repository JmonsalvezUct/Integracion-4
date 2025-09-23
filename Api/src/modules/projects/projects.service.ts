// Mock data for testing

import { prisma } from "../../app/loaders/prisma.js"; 
let projects: any[] = [
  { id: 1, name: "Proyecto Alpha", description: "Proyecto inicial", createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: "Proyecto Beta", description: "Segundo proyecto", createdAt: new Date(), updatedAt: new Date() }
];
let nextId = 3;

type CloneOpts = { name?: string };

export type SortBy = "name" | "date" | "activity";
export type Order  = "asc" | "desc";
export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  tasksCount?: number;
}

export const projectService = {
  // TDI-79: Crear proyecto
  createProject: async (data: { name: string; description?: string }) => {
    const project = {
      id: nextId++,
      name: data.name,
      description: data.description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    projects.push(project);
    return project;
  },

  async cloneProject(projectId: number, opts: CloneOpts = {}) {
   
    const src = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!src) return null;

 
    const newProject = await prisma.project.create({
      data: {
        name: opts.name ?? `${src.name} (copia)`,
        description: src.description ?? null,
      },
    });

    return newProject;
  },

  // TDI-80: Obtener todos los proyectos
 getAllProjects: async (opts?: { sortBy?: SortBy; order?: Order }) => {
    const sortBy: SortBy = opts?.sortBy ?? "date";
    const order: Order   = opts?.order  ?? "asc";
    const dir = order === "desc" ? -1 : 1;

    const sorted = [...projects].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name) * dir;

        case "activity": {
          const av = a.tasksCount ?? 0;
          const bv = b.tasksCount ?? 0;
          if (av === bv) return 0;
          return av > bv ? dir : -dir;
        }

        case "date":
        default: {
          // Usa createdAt como “fecha” (si prefieres updatedAt, cámbialo aquí).
          const av = a.createdAt?.getTime?.() ?? 0;
          const bv = b.createdAt?.getTime?.() ?? 0;
          if (av === bv) return 0;
          return av > bv ? dir : -dir;
        }
      }
    });

    return sorted;
  },

  // TDI-81: Obtener proyecto por ID
  getProjectById: async (id: number) => {
    return projects.find(project => project.id === id);
  },

  // TDI-82: Actualizar proyecto
  updateProject: async (id: number, data: { name?: string; description?: string }) => {
    const projectIndex = projects.findIndex(project => project.id === id);
    if (projectIndex === -1) return null;

    projects[projectIndex] = {
      ...projects[projectIndex],
      ...data,
      updatedAt: new Date()
    };

    return projects[projectIndex];
  },

  // TDI-83: Eliminar proyecto
  deleteProject: async (id: number) => {
    const projectIndex = projects.findIndex(project => project.id === id);
    if (projectIndex === -1) return false;

    projects.splice(projectIndex, 1);
    return true;
  }


};
//----------------------------------------------------
