import { Router } from "express";
import tasksRoutes from "../modules/tasks/tasks.routes";
import projectsRoutes from "../modules/projects/projects.routes";

const routes = Router();

routes.use("/tasks", tasksRoutes);       
routes.use("/projects", projectsRoutes); 

export default routes;
