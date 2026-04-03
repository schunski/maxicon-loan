import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDatabase() {
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  let sql = fs.readFileSync(schemaPath, 'utf8');
  sql = sql.replace(/^\uFEFF/, '');
  await pool.query(sql);
}
