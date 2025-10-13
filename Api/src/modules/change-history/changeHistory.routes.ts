    import { Router } from "express";
    import { changeHistoryController } from "./changeHistory.controller.js";
    import { authMiddleware } from "../../middlewares/auth.middleware.js";
    import { rbacMiddleware } from "../../middlewares/rbac.middleware.js";

    const router = Router();

    /**
     * @swagger
     * /change-history/task/{taskId}:
     *   get:
     *     summary: Obtener historial de cambios de una tarea
     *     description: Devuelve todos los registros de auditoría asociados a una tarea.
     *     tags: [ChangeHistory]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: taskId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de la tarea
     *     responses:
     *       200:
     *         description: Lista de cambios
     */
    router.get(
    "/task/:taskId",
    authMiddleware,
    changeHistoryController.getByTask
    );
    router.get("/project/:projectId", authMiddleware, changeHistoryController.getHistoryByProject); // 👈 NUEVO



    export default router;
