import { Router } from 'express';
import { register, login, me, refresh, logout, recoverPassword, resetPassword} from './auth.controller.js';
import { authMiddleware, validateRecoverPassword, validateResetPassword} from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/ratelimit.middleware.js';
const router = Router();
router.post('/register', register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);



/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the User
 *         name:
 *           type: string
 *           description: The name of the user
 *       example:
 *         id: 1
 *         name: Luke Skywalker
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: The User managing API
 */

/**
 * @swagger
 * /api/auth/me:
 *   post:
 *     summary: Returns the User
 *     tags: [User]
 *     responses:
 *       200:
 *         description: The User
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/me', authMiddleware, me);
router.post("/recover-password", authLimiter, validateRecoverPassword, recoverPassword);
router.post("/reset-password", authLimiter, validateResetPassword, resetPassword);

export default router;
