import express from 'express';
import { PORT } from './config';

const app = express();

// Middlewares
app.use(express.json());

// Rutas
app.use('/api', require('./app/routes').default);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});