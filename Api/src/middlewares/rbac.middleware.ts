import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.middleware.js';
import { projectsRepository } from '../modules/projects/projects.repository.js';

/**
 * RBAC middleware for project-based role access
 * Usage: rbacMiddleware(['admin', 'developer'])
 */
export function rbacMiddleware(allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const projectId = Number(req.body.projectId || req.params.projectId);
    if (!userId || !projectId) {
      return res.status(400).json({ error: 'Missing user or project id' });
    }
    const member = await projectsRepository.getProjectMemberByUserId(projectId, userId);
    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }
    if (!allowedRoles.includes(member.role)) {
      return res.status(403).json({ error: 'Insufficient role' });
    }
    next();
  };
}
