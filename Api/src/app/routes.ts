import { Router } from "express";
import tasksRoutes from "../modules/tasks/tasks.routes"; 

const routes = Router();
routes.use("/tasks", tasksRoutes);

export default routes;
