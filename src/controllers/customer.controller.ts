import { Request, Response } from 'express';
import * as customerService from '../services/customer.service';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nit, name, phone } = req.body;

    // Validación básica de campos
    if (!nit || !name) {
      res.status(400).json({ error: 'validation_error', details: ['nit and name are required'] });
      return;
    }

    const newCustomer = await customerService.createCustomer({ nit, name, phone });
    res.status(201).json(newCustomer);
  } catch (error: any) {
    if (error.message === 'DUPLICATE_NIT') {
      res.status(400).json({ error: 'Customer with this NIT already exists' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getByNit = async (req: Request, res: Response): Promise<void> => {
  try {
    const  nit  = req.params.nit as string;
    const customer = await customerService.getCustomer(nit);

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};