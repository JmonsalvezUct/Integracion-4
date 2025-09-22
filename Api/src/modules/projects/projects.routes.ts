// projects.routes.ts
import { Router } from "express";
import { projectController } from "./projects.controller.js";
const router = Router();

router.get("/",        projectController.getAllProjects);
router.get("/:id",     projectController.getProjectById);
router.post("/",       projectController.createProject);
router.put("/:id",     projectController.updateProject);
router.delete("/:id",  projectController.deleteProject);

export default router;
