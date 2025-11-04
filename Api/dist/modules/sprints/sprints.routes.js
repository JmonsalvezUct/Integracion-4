import { Router } from "express";
import { createSprint, getSprintsByProjectId, getSprintById, updateSprint, deleteSprint, finalizeSprint, } from "./sprints.controller.js";
const router = Router({ mergeParams: true });
router.post("/", createSprint);
router.get("/", getSprintsByProjectId);
router.get("/:sprintId", getSprintById);
router.put("/:sprintId", updateSprint);
router.patch("/:sprintId/finalize", finalizeSprint);
router.delete("/:sprintId", deleteSprint);
export default router;
//# sourceMappingURL=sprints.routes.js.map