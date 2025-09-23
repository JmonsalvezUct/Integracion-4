import type { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export default function loadSecurity(app: Application) {
  app.set('trust proxy', 1); 
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }));
}
