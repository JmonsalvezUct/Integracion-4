import { Router } from "express";
import { createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectsByUserId, addUserToProject, updateUserRoleInProject, removeUserFromProject, getProjectMembers, patchProject } from './projects.controller.js';
import { rbacMiddleware } from "../../middlewares/rbac.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();


/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Crear nuevo proyecto
 *     description: Crea un nuevo proyecto y asigna al usuario creador como administrador.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Proyecto Web"
 *                 minLength: 3
 *               description:
 *                 type: string
 *                 example: "Desarrollo de aplicación web con React"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *     responses:
 *       201:
 *         description: Proyecto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 createdBy:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *     x-middleware:
 *       - authMiddleware
 */
router.post('/', authMiddleware, createProject);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Obtener todos los proyectos
 *     description: Retorna lista paginada de proyectos a los que tiene acceso el usuario.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o descripción
 *     responses:
 *       200:
 *         description: Lista de proyectos paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *     x-middleware:
 *       - authMiddleware
 */

router.get('/', getProjects);

/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     summary: Obtener proyecto por ID
 *     description: Obtiene los detalles completos de un proyecto específico.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Detalles del proyecto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 createdBy:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [admin, member, viewer]
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos para ver este proyecto
 *       404:
 *         description: Proyecto no encontrado
 *     x-middleware:
 *       - authMiddleware
 */

router.get('/:projectId', authMiddleware, rbacMiddleware(['admin', 'developer', 'guest']), getProjectById);

/**
 * @swagger
 * /projects/{projectId}:
 *   put:
 *     summary: Actualizar proyecto
 *     description: Permite actualizar los detalles de un proyecto existente (solo admin).
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Proyecto Web v2"
 *                 minLength: 3
 *               description:
 *                 type: string
 *                 example: "Actualización del proyecto web con nuevas funcionalidades"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               status:
 *                 type: string
 *                 enum: [active, paused, completed]
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Proyecto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos para editar el proyecto
 *       404:
 *         description: Proyecto no encontrado
 *     x-middleware:
 *       - authMiddleware
 */

router.put('/:projectId', authMiddleware, rbacMiddleware(['admin']), updateProject);

/**
 * @swagger
 * /projects/{projectId}:
 *   patch:
 *     summary: Actualización parcial de proyecto
 *     description: Permite actualizar campos específicos de un proyecto sin necesidad de enviar todos los datos (solo admin).
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Proyecto Web v2"
 *                 minLength: 2
 *               description:
 *                 type: string
 *                 example: "Actualización parcial del proyecto"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-01T00:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-31T00:00:00Z"
 *               status:
 *                 type: string
 *                 enum: [active, paused, completed]
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Proyecto actualizado parcialmente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 createdBy:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos para editar el proyecto
 *       404:
 *         description: Proyecto no encontrado
 *     x-middleware:
 *       - authMiddleware
 */
router.patch('/:projectId', authMiddleware, rbacMiddleware(['admin']), patchProject);

/**
 * @swagger
 * /projects/{projectId}:    
 *   delete:
 *     summary: Eliminar proyecto
 *     description: Permite a los administradores eliminar un proyecto y todos sus recursos asociados.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto a eliminar
 *     responses:
 *       204:
 *         description: Proyecto eliminado exitosamente
 *       400:
 *         description: Error al eliminar el proyecto
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Proyecto no encontrado
 *     x-middleware:
 *       - authMiddleware
 *       - rbacMiddleware
 */

router.delete('/:projectId', authMiddleware, rbacMiddleware(['admin']), deleteProject);

/**
 * @swagger
 * /projects/user/{userId}:
 *   get:
 *     summary: Obtener proyectos por ID de usuario
 *     description: Retorna todos los proyectos asociados a un usuario específico.
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

router.get('/user/:userId', authMiddleware, getProjectsByUserId);

/**
 * @swagger
 * /projects/member:
 *   post:
 *     summary: Agregar usuario al proyecto
 *     description: Permite a los administradores añadir un nuevo miembro al proyecto con un rol específico.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - userId
 *               - role
 *             properties:
 *               projectId:
 *                 type: integer
 *                 example: 1
 *                 description: ID del proyecto
 *               userId:
 *                 type: integer
 *                 example: 2
 *                 description: ID del usuario a agregar
 *               role:
 *                 type: string
 *                 enum: [admin, developer, guest]
 *                 example: "guest"
 *                 description: Rol inicial del usuario en el proyecto
 *     responses:
 *       200:
 *         description: Usuario agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 projectId:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 role:
 *                   type: string
 *                 addedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Usuario ya es miembro o datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Proyecto o usuario no encontrado
 *     x-middleware:
 *       - authMiddleware
 *       - rbacMiddleware
 */

router.post('/member', authMiddleware, rbacMiddleware(['admin']), addUserToProject);

/**
 * @swagger
 * /projects/members/role:
 *   put:
 *     summary: Actualizar rol de usuario en proyecto
 *     description: Permite a los administradores cambiar el rol de un miembro en el proyecto.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userProjectId
 *               - role
 *             properties:
 *               userProjectId:
 *                 type: integer
 *                 example: 1
 *                 description: ID del registro de usuario en el proyecto (userProject)
 *               role:
 *                 type: string
 *                 enum: [admin, developer, guest]
 *                 example: "guest"
 *                 description: Nuevo rol para el usuario
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projectId:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 role:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos inválidos o rol no permitido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador en el proyecto
 *       404:
 *         description: Proyecto o usuario no encontrado
 *     x-middleware:
 *       - authMiddleware
 *       - rbacMiddleware
 */

router.put('/members/role', authMiddleware, rbacMiddleware(['admin']), updateUserRoleInProject);

/**
 * @swagger
 * /projects/member:
 *   delete:
 *     summary: Eliminar usuario del proyecto
 *     description: Permite a los administradores remover un miembro del proyecto.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userProjectId
 *             properties:
 *               userProjectId:
 *                 type: integer
 *                 example: 1
 *                 description: ID del registro de usuario en el proyecto (userProject)
 *     responses:
 *       200:
 *         description: User removed from project
 *       403:
 *         description: Insufficient role
 */

router.delete('/member', authMiddleware, rbacMiddleware(['admin']), removeUserFromProject);

/**
 * @swagger
 * /projects/{projectId}/members:
 *   get:
 *     summary: Obtener miembros del proyecto
 *     description: Permite a los administradores obtener la lista completa de miembros de un proyecto con sus roles y detalles.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, member, viewer]
 *         description: Filtrar por rol (opcional)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o email del miembro (opcional)
 *     responses:
 *       200:
 *         description: Lista de miembros del proyecto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       userId:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: "Juan Pérez"
 *                       email:
 *                         type: string
 *                         example: "juan@ejemplo.com"
 *                       role:
 *                         type: string
 *                         enum: [admin, member, viewer]
 *                         example: "member"
 *                       joinedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-01T10:00:00Z"
 *                       lastActivity:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-27T15:30:00Z"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador en el proyecto
 *       404:
 *         description: Proyecto no encontrado
 *     x-middleware:
 *       - authMiddleware
 *       - rbacMiddleware
 */

router.get('/:projectId/members', authMiddleware, rbacMiddleware(['admin', 'developer', 'guest']), getProjectMembers);

export default router;
