import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const login = (req: Request, res: Response): void => {
  const { username, access_key } = req.body;

  // Validación requerida por la prueba
  if (!username || !access_key) {
    res.status(400).json({ 
      error: 'validation_error', 
      details: ['username and access_key are required'] 
    });
    return;
  }

  // Generación del JWT simulado
  const secret = process.env.JWT_SECRET || 'super_secret_mock_key_2026';
  const expiresIn = 3600; // 1 hora

  const token = jwt.sign({ username }, secret, { expiresIn });

  // Respuesta exitosa
  res.status(200).json({
    access_token: token,
    expires_in: expiresIn
  });
};