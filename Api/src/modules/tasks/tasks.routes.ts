import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import {
  createTask as createTaskVal,
  listTasks as listTasksVal,
  getTaskById as getTaskByIdVal,
  updateTask as updateTaskVal,
  deleteTask as deleteTaskVal,
} from "./tasks.validators";
import {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "./tasks.controller";

const router = Router();
/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Crear una nueva tarea
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreate'
 *           example:
 *             title: "Diseñar pantalla de login"
 *             description: "Vista en Figma"
 *             projectId: 1
 *             statusId: 1
 *             priorityId: 2
 *     responses:
 *       201:
 *         description: Tarea creada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Task' }
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/", validate(createTaskVal), createTask);


/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: Listar todas las tareas
 *     tags: [Tasks]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *       - $ref: '#/components/parameters/SortParam'
 *       - $ref: '#/components/parameters/OrderParam'
 *       - $ref: '#/components/parameters/StatusParam'
 *       - $ref: '#/components/parameters/QParam'
 *     responses:
 *       200:
 *         description: Lista de tareas
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TaskListResponse' }
 */
router.get("/", validate(listTasksVal), listTasks);

;

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Obtener tarea por ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Task' }
 *       404:
 *         description: No encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/:id", validate(getTaskByIdVal), getTaskById);


/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     summary: Actualizar tarea existente
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TaskUpdate' }
 *           example:
 *             title: "Login con validaciones"
 *             description: "Ajustar accesibilidad"
 *             statusId: 2
 *             priorityId: 1
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Task' }
 *       404:
 *         description: No encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put("/:id", validate(updateTaskVal), updateTask);
/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Eliminar tarea
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Eliminada correctamente
 *       404:
 *         description: No encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete("/:id", validate(deleteTaskVal), deleteTask);


export default router;
