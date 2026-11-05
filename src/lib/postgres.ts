import pg, { Pool } from 'pg';

// Parse DATE (OID 1082) as raw string 'YYYY-MM-DD' without converting to JavaScript Date
// to prevent timezone shift issues when saving/displaying dates
pg.types.setTypeParser(1082, (val: string) => val);

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hoba_lpg';

const pool = new Pool({
  connectionString,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

export default pool;
