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
  app.use(helmet()) // Helmet Configura cabeceras HTTP seguras
  app.use(cors()); // CORS Controla qué dominios pueden acceder a la API

  // app.use(
  //   cors({
  //     origin: ["proccess.env.WEB_URL", "URL mobile"], // Solo permite requests desde este dominio, configurar los de 2do cuando hagan deploy
  //     methods: ["GET", "POST", "PUT", "DELETE"],
  //     allowedHeaders: ["Content-Type", "Authorization"],
  //     credentials: true,
  //   })
  // );

  app.use(express.json());
  app.use(requestLogger); // logger
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api', routes); 
  app.use(errorHandler); // Middleware global de errores (debe ir al final)

  return app;
};
