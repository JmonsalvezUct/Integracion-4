import express from 'express';
import routes from './routes';

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use('/api', routes);

// Manejador de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});