import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.middleware.js';
import { projectsRepository } from '../modules/projects/projects.repository.js';
import { ProjectRoleType } from '@prisma/client';

/**
 * RBAC middleware for project-based role access
 * Usage: rbacMiddleware([ProjectRoleType.admin, ProjectRoleType.developer])
 */
export function rbacMiddleware(allowedRoles: ProjectRoleType[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const projectId = Number(req.params.projectId);

      if (!userId) {
        return res.status(400).json({ error: 'Missing user' });
      }

      if (!projectId) {
        return res.status(400).json({ error: 'missing project id' });
      }

      const member = await projectsRepository.getProjectMemberByUserId(projectId, userId);

      if (!member) {
        return res.status(403).json({ error: 'You are not a member of this project' });
      }

      if (!allowedRoles.includes(member.role as ProjectRoleType)) {
        return res.status(403).json({ error: 'Insufficient role' });
      }

      next();
    } catch (err) {
      console.error('RBAC error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
