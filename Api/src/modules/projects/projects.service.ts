// Mock data for testing
let projects: any[] = [
  { id: 1, name: "Proyecto Alpha", description: "Proyecto inicial", createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: "Proyecto Beta", description: "Segundo proyecto", createdAt: new Date(), updatedAt: new Date() }
];
let nextId = 3;

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

  // TDI-80: Obtener todos los proyectos
  getAllProjects: async () => {
    return projects;
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