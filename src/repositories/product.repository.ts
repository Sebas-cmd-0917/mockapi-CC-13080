import { pool } from '../config/database';

export interface ProductData {
  code: string;
  name: string;
  price: number;
  tax: number;
}

export const findAll = async (): Promise<ProductData[]> => {
  const { rows } = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
  return rows;
};

export const findByCode = async (code: string) => {
  const { rows } = await pool.query('SELECT * FROM items WHERE code = $1', [code]);
  return rows[0] ?? null;
};

export const create = async (product: ProductData) => {
  const { rows } = await pool.query(
    'INSERT INTO items (code, name, price, tax) VALUES ($1, $2, $3, $4) RETURNING *',
    [product.code, product.name, product.price, product.tax]
  );
  return rows[0];
};

// ANY($1::text[]) permite pasar el array directamente — PostgreSQL lo maneja con un solo parámetro
export const findManyByCodes = async (codes: string[]): Promise<ProductData[]> => {
  const { rows } = await pool.query(
    'SELECT * FROM items WHERE code = ANY($1::text[])',
    [codes]
  );
  return rows;
};
