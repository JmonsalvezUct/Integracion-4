import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import tasksRoutes from "./modules/tasks/tasks.routes.js";
import projectsRoutes from "./modules/projects/projects.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;


app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/", (_req, res) => res.json({ ok: true, name: "Task Manager API" }));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/tasks", tasksRoutes);
app.use("/api/projects", projectsRoutes);


app.use((_req, res) => res.status(404).json({ message: "Recurso no encontrado" }));

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Error interno del servidor" });
});


app.set("trust proxy", 1);
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/docs`);
});


export default app;