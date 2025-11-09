import type { ProjectRoleType } from "@prisma/client";
import type { Role } from "../config/permissions.js";


export interface UserProjectRole {
  projectId: number;
  role: ProjectRoleType;
}

export interface UserPayload {
  id: number;
  email?: string;
  name?: string;
  profilePicture?: string | null;


  role?: Role;


  roles?: {
    projectId: number;
    role: ProjectRoleType;
  }[];
}

