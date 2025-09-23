import type { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../../config/swagger.js';
import routes from '../routes.js';
import { errorHandler } from '../../middlewares/error.middleware.js';
import projectsRouter from '../../modules/projects/projects.routes.js';
export default function loadRoutes(app: Application) {

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


  app.use('/api', routes);


  app.use('/api', (_req, res) => res.status(404).json({ message: 'Recurso no encontrado' }));

  app.use('/projects', projectsRouter);
  app.use(errorHandler);
}
