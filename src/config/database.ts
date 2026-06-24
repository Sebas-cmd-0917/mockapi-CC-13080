import { Pool } from 'pg';

export const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'siigo_mock',
  user:     process.env.DB_USER     || 'siigo_user',
  password: process.env.DB_PASSWORD || 'siigo_pass_2026',
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});
