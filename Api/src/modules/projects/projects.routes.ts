import { Router } from "express";
import { createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectsByUserId, getUserRolesInProjects } from './projects.controller.js';
const router = Router();

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.get('/user/:userId', getProjectsByUserId);
router.get('/user/:userId/roles', getUserRolesInProjects);

export default router;
