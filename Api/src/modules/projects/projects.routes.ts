import { Router } from "express";
import { createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectsByUserId, addUserToProject, updateUserRoleInProject, removeUserFromProject, getProjectMembers } from './projects.controller.js';
import { rbacMiddleware } from "../../middlewares/rbac.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();


/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created
 */
router.post('/', createProject);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects
 */

router.get('/', getProjects);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project details
 */

router.get('/:id',getProjectById);

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated
 */

router.put('/:id', updateProject);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Project deleted
 */

router.delete('/:id', deleteProject);

/**
 * @swagger
 * /projects/user/{userId}:
 *   get:
 *     summary: Get projects by user ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of projects for user
 */

router.get('/user/:userId', getProjectsByUserId);

/**
 * @swagger
 * /projects/member:
 *   post:
 *     summary: Add user to project (admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User added to project
 *       403:
 *         description: Insufficient role
 */

router.post('/member', authMiddleware, rbacMiddleware(['admin']), addUserToProject);

/**
 * @swagger
 * /projects/members/role:
 *   put:
 *     summary: Update user role in project (admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User role updated
 *       403:
 *         description: Insufficient role
 */

router.put('/members/role', authMiddleware, rbacMiddleware(['admin']), updateUserRoleInProject);

/**
 * @swagger
 * /projects/member:
 *   delete:
 *     summary: Remove user from project (admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User removed from project
 *       403:
 *         description: Insufficient role
 */

router.delete('/member', authMiddleware, rbacMiddleware(['admin']), removeUserFromProject);

/**
 * @swagger
 * /projects/{id}/members:
 *   get:
 *     summary: Get project members (admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of project members
 *       403:
 *         description: Insufficient role
 */

router.get('/:id/members', authMiddleware, rbacMiddleware(['admin']), getProjectMembers);

export default router;
