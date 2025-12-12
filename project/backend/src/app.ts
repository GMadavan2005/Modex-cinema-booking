import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import showRoutes from './routes/showRoutes';
import bookingRoutes from './routes/bookingRoutes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Ticket Booking API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', showRoutes);
app.use('/api', bookingRoutes);

app.use(errorHandler);

export default app;
