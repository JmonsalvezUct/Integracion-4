import { Router } from "express";
import { postTask } from "./tasks.controller"
const router = Router();

router.post("/tasks", postTask);

export default router;
