import express from 'express';
import routes from '../routes.js';
import cors from 'cors';
import { errorHandler } from '../../middlewares/error.middleware.js';

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', routes);
  app.use(errorHandler); // Middleware global de errores (debe ir al final)
  return app;
};
