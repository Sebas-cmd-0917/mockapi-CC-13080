import { Request, Response, NextFunction } from 'express';

export const simulateNetworkDelay = (req: Request, res: Response, next: NextFunction) => {
  // Generar un tiempo aleatorio entre 200ms y 1200ms
  const min = 200;
  const max = 1200;
  const delay = Math.floor(Math.random() * (max - min + 1) + min);
  
  // Agregar un header personalizado para que puedas ver el retraso exacto en Postman/Navegador (buen toque de senior)
  res.setHeader('X-Simulated-Delay-Ms', delay.toString());

  setTimeout(() => {
    next();
  }, delay);
};