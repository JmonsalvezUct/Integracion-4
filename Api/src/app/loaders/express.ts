import express from 'express';
import routes from '../routes.js';
import cors from 'cors';
import { errorHandler } from '../../middlewares/error.middleware.js';
import { requestLogger } from "../../middlewares/logger.middleware.js";
import helmet from 'helmet';

export const createApp = () => {
  const app = express();
  app.use(helmet()) // Helmet Configura cabeceras HTTP seguras
  app.use(cors()); // CORS Controla qué dominios pueden acceder a la API

  // app.use(
  //   cors({
  //     origin: ["http://localhost:3000"], // Solo permite requests desde este dominio, configurar los de 2do cuando hagan deploy
  //     methods: ["GET", "POST", "PUT", "DELETE"],
  //     allowedHeaders: ["Content-Type", "Authorization"],
  //     credentials: true,
  //   })
  // );
  
  app.use(express.json());
  app.use(requestLogger); // logger
  app.use('/api', routes);
  app.use(errorHandler); // Middleware global de errores (debe ir al final)
  return app;
};
