import { pool } from '../config/database';

export interface InvoiceInsert {
  number: string;
  customer_nit: string;
  total: number;
  status: string;
}

export interface InvoiceItemInsert {
  invoice_id: string;
  item_code: string;
  quantity: number;
  price: number;
}

export type InvoiceItemPayload = Omit<InvoiceItemInsert, 'invoice_id'>;

export const findByNumber = async (number: string) => {
  const { rows } = await pool.query('SELECT * FROM invoices WHERE number = $1', [number]);
  return rows[0] ?? null;
};

/**
 * Inserta la cabecera de la factura y sus líneas dentro de una transacción.
 * Si falla cualquier INSERT, se hace ROLLBACK completo.
 */
export const createWithItems = async (
  invoice: InvoiceInsert,
  items: InvoiceItemPayload[]
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [newInvoice] } = await client.query(
      'INSERT INTO invoices (number, customer_nit, total, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [invoice.number, invoice.customer_nit, invoice.total, invoice.status]
    );

    for (const item of items) {
      await client.query(
        'INSERT INTO invoice_items (invoice_id, item_code, quantity, price) VALUES ($1, $2, $3, $4)',
        [newInvoice.id, item.item_code, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');
    return newInvoice;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
