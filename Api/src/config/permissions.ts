export type Role = "admin" | "developer" | "guest";

export const Permissions = {
  project: {
    view: ["admin", "developer", "guest"],
    edit: ["admin", "developer"],
    delete: ["admin"],
  },
  task: {
    view: ["admin", "developer", "guest"],
    create: ["admin", "developer"],
    assign: ["admin"],
    update: ["admin", "developer"],
    delete: ["admin"],
  },
  sprint: {
    view: ["admin", "developer"],
    create: ["admin"],
    update: ["admin"],
    close: ["admin"],
  },
} as const;
