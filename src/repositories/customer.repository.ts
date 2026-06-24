import { pool } from '../config/database';

export interface CustomerData {
  nit: string;
  name: string;
  phone?: string;
}

export const findByNit = async (nit: string) => {
  const { rows } = await pool.query<CustomerData & { id: string; created_at: string }>(
    'SELECT * FROM customers WHERE nit = $1',
    [nit]
  );
  return rows[0] ?? null;
};

export const create = async (customer: CustomerData) => {
  const { rows } = await pool.query(
    'INSERT INTO customers (nit, name, phone) VALUES ($1, $2, $3) RETURNING *',
    [customer.nit, customer.name, customer.phone ?? null]
  );
  return rows[0];
};
