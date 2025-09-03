import express from 'express';
import routes from '../routes.js';
import cors from 'cors';

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', routes);
  return app;
};
