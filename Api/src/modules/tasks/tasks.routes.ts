import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createTask as createTaskVal,
  listTasks as listTasksVal,
  getTaskById as getTaskByIdVal,
  updateTask as updateTaskVal,
  deleteTask as deleteTaskVal,
} from "./tasks.validators.js";
import {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "./tasks.controller.js";

const router = Router();

router.post("/",    validate(createTaskVal), createTask);
router.get("/",     validate(listTasksVal),  listTasks);
router.get("/:id",  validate(getTaskByIdVal), getTaskById);
router.put("/:id",  validate(updateTaskVal),  updateTask);  
router.delete("/:id", validate(deleteTaskVal), deleteTask); 

export default router;
