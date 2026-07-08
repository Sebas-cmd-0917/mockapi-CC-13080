import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { simulateNetworkDelay } from './middlewares/delay';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import productRoutes from './routes/product.routes';
import invoiceRoutes from './routes/invoice.routes';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(simulateNetworkDelay);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/invoices', invoiceRoutes);

export default app;