import { Request, Response } from 'express';
import { z } from 'zod';
import * as itemService from '../services/item.service';

const createItemSchema = z.object({
  code: z.string().min(1, 'code is required'),
  name: z.string().min(1, 'name is required'),
  price: z.number().positive('price must be greater than 0'),
  tax: z.number().min(0, 'tax must be >= 0'),
});

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          details: parsed.error.issues.map((i) => i.message),
        },
      });
      return;
    }

    const item = await itemService.createItem(parsed.data);
    res.status(201).json(item);
  } catch (error: any) {
    if (error.message === 'DUPLICATE_CODE') {
      res.status(400).json({
        error: {
          code: 'DUPLICATE_CODE',
          details: [`Item with code '${String(req.body.code)}' already exists`],
        },
      });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = req.params['code'] as string;
    const item = await itemService.getItem(code);

    if (!item) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', details: [`Item with code '${code}' not found`] },
      });
      return;
    }

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
