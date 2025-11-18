export const Permissions = {
  project: {
    view: ["admin", "developer", "guest"],
    edit: ["admin"],          // Editar proyecto
    stats: ["admin", "developer", "guest"],         // Ver estadísticas
    manageTags: ["admin"],    // Tags
    viewMembers: ["admin", "developer", "guest"], // TODOS ven miembros
    manageMembers: ["admin"], // SOLO admin puede invitar / cambiar roles
  },

  sprint: {
    view: ["admin"], // TODOS ven sprints
    create: ["admin"],                     // SOLO admin crea sprints
    edit: ["admin"],                       // SOLO admin edita sprints
    delete: ["admin"],                     // SOLO admin elimina sprints
  },

  task: {
    view: ["admin", "developer", "guest"],
    edit: ["admin", "developer"],
    delete: ["admin"],
  },

} as const;
