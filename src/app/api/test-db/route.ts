import { NextResponse } from 'next/server';
import pool from '@/lib/postgres';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || '';
    // Mask password in DB URL for security
    const maskedUrl = dbUrl ? dbUrl.replace(/:([^:@]+)@/, ':******@') : 'NOT_DEFINED';

    const client = await pool.connect();
    try {
      const res = await client.query('SELECT current_database(), now()');
      return NextResponse.json({
        success: true,
        env_db_url: maskedUrl,
        query_result: res.rows[0],
        message: 'Server-side connection to PostgreSQL is working perfectly!'
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}
