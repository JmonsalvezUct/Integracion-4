import { Router } from "express";
    import {
    createTag,
    getTagsByProject,
    assignTagToTask,
    removeTagFromTask,
    getTagsByTask,
    } 
from "./tags.controller.js";

const router = Router();


router.post("/", createTag);


router.get("/project/:projectId", getTagsByProject);


router.post("/assign", assignTagToTask);


router.delete("/remove/:taskId/:tagId", removeTagFromTask);


router.get("/task/:taskId", getTagsByTask);

export default router;
