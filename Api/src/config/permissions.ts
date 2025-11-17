export const Permissions = {
  project: {
    view: ["admin", "developer", "guest"],
    edit: ["admin", "developer"],
    delete: ["admin"],
    manageTags: ["admin"],

    viewMembers: ["admin", "developer"],
    manageMembers: ["admin"],
  },
  task: {
    view: ["admin", "developer", "guest"],
    edit: ["admin", "developer"],
    delete: ["admin"],
  },
} as const;


export type Resource = keyof typeof Permissions;
export type Action<R extends Resource> = keyof typeof Permissions[R];
export type Role = (typeof Permissions)[Resource][Action<Resource>][number];
