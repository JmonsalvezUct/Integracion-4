import { Router } from "express";
import { createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectsByUserId, addUserToProject, updateUserRoleInProject, removeUserFromProject, getProjectMembers } from './projects.controller.js';
import { rbacMiddleware } from "../../middlewares/rbac.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id',getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.get('/user/:userId', getProjectsByUserId);
router.post('/member', authMiddleware, rbacMiddleware(['admin']), addUserToProject);
router.put('/members/role', authMiddleware, rbacMiddleware(['admin']), updateUserRoleInProject);
router.delete('/member', authMiddleware, rbacMiddleware(['admin']), removeUserFromProject);
router.get('/:id/members', authMiddleware, rbacMiddleware(['admin']), getProjectMembers);

export default router;
