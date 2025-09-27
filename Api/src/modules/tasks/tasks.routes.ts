import { Router } from 'express';
import {
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByProject,
  assignTask,
  changeStatus,
} from './tasks.controller.js';

const router = Router();

router.post('/', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

router.get('/project/:projectId', getTasksByProject);
router.post('/:id/assign', assignTask);
router.post('/:id/status', changeStatus);

export default router;
