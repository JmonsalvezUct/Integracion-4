// src/modules/tasks/tasks.routes.ts
import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import * as val from "./tasks.validators";
import * as ctrl from "./tasks.controller";
import { authorizeProject } from "../projects/authorize.middleware";

const router = Router();

// POST /api/tasks  -> owner/admin
router.post(
  "/",
  authorizeProject(["owner", "admin"]),   // ← controla rol según projectId
  validate(val.createTask),
  ctrl.createTask
);

// (Opcional) si ya tienes estos controladores/validadores, añádelos:
router.get("/", validate(val.listTasks), ctrl.listTasks);
router.get("/:id", validate(val.getTaskById), ctrl.getTaskById);
router.put(
  "/:id",
  authorizeProject(["owner", "admin"]),   // ← resuelve projectId desde la tarea
  validate(val.updateTask),
  ctrl.updateTask
);
router.delete(
  "/:id",
  authorizeProject(["owner", "admin"]),   // ← idem
  validate(val.deleteTask),
  ctrl.deleteTask
);

export default router;
