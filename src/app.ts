import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

// Middleware local para simular la lentitud de red (200ms - 1200ms)
app.use((req: Request, res: Response, next: Function) => {
  const delay = Math.floor(Math.random() * (1200 - 200 + 1) + 200);
  setTimeout(() => next(), delay);
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Rutas
app.use('/auth', authRoutes);

export default app;