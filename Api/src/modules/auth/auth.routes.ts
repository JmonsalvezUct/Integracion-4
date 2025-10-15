import { Router } from 'express';
import { register, login, refresh, logout, recoverPassword, resetPassword} from './auth.controller.js';
import { authMiddleware, validateRecoverPassword, validateResetPassword} from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/ratelimit.middleware.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario en el sistema. El email debe ser único.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *                 description: Email único del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "MiContraseña123!"
 *                 description: Contraseña segura, mínimo 8 caracteres
 *               name:
 *                 type: string
 *                 example: "Juan Pérez"
 *                 description: Nombre completo del usuario
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: usuario@ejemplo.com
 *                 name:
 *                   type: string
 *                   example: Juan Pérez
 *       400:
 *         description: Datos inválidos o email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: El email ya está registrado
 *     security: []
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica al usuario y retorna un token JWT junto con la información del usuario.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "MiContraseña123!"
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: Credenciales inválidas
 *       429:
 *         description: Demasiados intentos fallidos
 *     security: []
 *     x-middleware:
 *       - authLimiter
 */
router.post('/login', authLimiter, login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refrescar access token JWT
 *     description: Genera un nuevo token de acceso JWT usando el token de refresco.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Token de refresco inválido o expirado
 *     security: []
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Invalida el token JWT actual del usuario.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       401:
 *         description: Token no válido o sesión ya cerrada
 *     x-middleware:
 *       - authMiddleware
 */
router.post('/logout', authMiddleware, logout);

/**
 * @swagger
 * /auth/recover-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     description: Envía un email con un enlace para restablecer la contraseña.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *     responses:
 *       200:
 *         description: Email de recuperación enviado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Se ha enviado un email con las instrucciones
 *       400:
 *         description: Email no encontrado
 *       429:
 *         description: Demasiadas solicitudes de recuperación
 *     security: []
 *     x-middleware:
 *       - authLimiter
 *       - validateRecoverPassword
 */
router.post("/recover-password", authLimiter, validateRecoverPassword, recoverPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     description: Cambia la contraseña usando el token de recuperación.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token recibido por email
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Nueva contraseña
 *                 example: "NuevaContraseña123!"
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contraseña actualizada correctamente
 *       400:
 *         description: Token inválido o contraseña no cumple requisitos
 *       429:
 *         description: Demasiados intentos de restablecimiento
 *     security: []
 *     x-middleware:
 *       - authLimiter
 *       - validateResetPassword
 */
router.post("/reset-password", authLimiter, validateResetPassword, resetPassword);

export default router;
