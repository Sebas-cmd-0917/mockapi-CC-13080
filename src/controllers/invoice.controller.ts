import { Request, Response } from 'express';
import { z } from 'zod';
import * as invoiceService from '../services/invoice.service';

const invoiceItemSchema = z.object({
  item_code: z.string().min(1, 'item_code is required'),
  quantity: z.number().int('quantity must be an integer').positive('quantity must be > 0'),
});

const createInvoiceSchema = z.object({
  number: z.string().min(1, 'number is required'),
  customer_nit: z.string().min(1, 'customer_nit is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          details: parsed.error.issues.map((i) => i.message),
        },
      });
      return;
    }

    const invoice = await invoiceService.createInvoice(parsed.data);

    res.status(201).json({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
    });
  } catch (error: any) {
    if (error.message === 'VALIDATION_ERROR') {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          details: error.details ?? [],
        },
      });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
