import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../../config/swagger.js";
import { requestLogger } from "../../middlewares/logger.middleware.js";
import { errorHandler } from "../../middlewares/error.middleware.js";
import routes from "../routes.js";

export const createApp = () => {
  const app = express();

  // 🧠 Seguridad y CORS
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // 🧾 Logs
  app.use(requestLogger);

  // ✅ Ruta base simple para probar que el backend responde
  app.get("/", (_req, res) => {
    res.send("✅ API en funcionamiento — visita /api o /docs");
  });

  // 📘 Documentación Swagger
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // 🚀 Rutas principales
  app.use("/api", routes);


  app.use("/api", (_req, res) => res.status(404).json({ message: "Recurso no encontrado" }));
  app.use(errorHandler);

  return app;
};
