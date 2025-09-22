import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { authorizeProject } from "./authorize.middleware.js";
import { getProjectTasks as getProjectTasksVal } from "./projects.validators.js";
import { getProjectTasks } from "./projects.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { projectController } from './projects.controller.js';
import { cloneProjectSchema } from "./projects.validators.js";                // ajusta path
import { cloneProjectController } from "./projects.controller.js"; 
const router = Router();
/**
 * @openapi
 * /projects/{id}/tasks:
 *   get:
 *     summary: Listar tareas de un proyecto
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: ID del proyecto
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *       - $ref: '#/components/parameters/SortParam'
 *       - $ref: '#/components/parameters/OrderParam'
 *       - $ref: '#/components/parameters/StatusParam'
 *       - $ref: '#/components/parameters/QParam'
 *     responses:
 *       200:
 *         description: Lista de tareas del proyecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskListResponse'
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

router.get(
  "/:id/tasks",
  authorizeProject(["owner", "admin", "member"]),  
  validate(getProjectTasksVal),
  getProjectTasks
);



/**
 * @openapi
 * /projects/{id}/clone:
 *   post:
 *     summary: Clonar proyecto (duplica estructura)
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               copyMembers: { type: boolean, default: false }
 *               copyAttachments: { type: boolean, default: false }
 *     responses:
 *       201: { description: Proyecto clonado }
 *       403: { description: Prohibido }
 *       404: { description: Proyecto no existe }
 */
router.post('/:id/clone',
  authMiddleware,
  validate(cloneProjectSchema),
 
  cloneProjectController
);

router.get("/",        projectController.getAllProjects);
router.get("/:id",     projectController.getProjectById);
router.post("/",       projectController.createProject);
router.put("/:id",     projectController.updateProject);
router.delete("/:id",  projectController.deleteProject);

export default router;
