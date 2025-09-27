import { Router } from "express";
import { createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectsByUserId, addUserToProject, updateUserRoleInProject, removeUserFromProject, getProjectMembers } from './projects.controller.js';
import { rbacMiddleware } from "../../middlewares/rbac.middleware.js";

const router = Router();

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id',getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.get('/user/:userId', getProjectsByUserId);
router.post('/member', addUserToProject);
router.put('/members/role', updateUserRoleInProject);
router.delete('/member', removeUserFromProject);
router.get('/:id/members', getProjectMembers);

export default router;
