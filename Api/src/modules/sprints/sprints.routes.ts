import { Router } from "express";
import {
  createSprint,
  getSprintsByProjectId,
  getSprintById,
  updateSprint,
  deleteSprint,
  finalizeSprint,
} from "./sprints.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.post("/", roleMiddleware(["admin"]), createSprint);

router.put("/:sprintId", roleMiddleware(["admin"]), updateSprint);

router.patch("/:sprintId/finalize", roleMiddleware(["admin"]), finalizeSprint);

router.delete("/:sprintId", roleMiddleware(["admin"]), deleteSprint);

router.get("/", getSprintsByProjectId);

router.get("/:sprintId", getSprintById);

export default router;
