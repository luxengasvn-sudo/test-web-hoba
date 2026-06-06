import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/postgres';

const WHITELIST_TABLES = [
  'admin_users',
  'chapters',
  'chapter_leadership',
  'members',
  'contact_messages',
  'news',
  'documents',
  'website_config'
];

// Simple helper to check if a string is a safe identifier (alphanumeric and underscores)
function isSafeIdentifier(str: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(str);
}

// Check if a select string is safe (alphanumeric, underscores, commas, spaces, stars)
function isSafeSelect(str: string): boolean {
  return /^[a-zA-Z0-9_,\s\*]+$/.test(str);
}

function sanitizeParam(table: string, col: string, val: any): any {
  if (table === 'website_config' && col === 'value' && typeof val === 'object' && val !== null) {
    return JSON.stringify(val);
  }
  return val;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      method = 'SELECT',
      table,
      selects = '*',
      filters = [],
      orderCol,
      orderAscending = true,
      limitCount,
      isSingle = false,
      insertRows = [],
      updatePayload = {}
    } = body;

    // 1. Validate table name
    if (!table || !WHITELIST_TABLES.includes(table)) {
      return NextResponse.json({ error: `Invalid or unauthorized table: ${table}` }, { status: 400 });
    }

    let queryText = '';
    const queryParams: any[] = [];
    let paramCounter = 1;

    // Helper to build WHERE clause
    const buildWhereClause = () => {
      if (!filters || filters.length === 0) return '';
      const parts: string[] = [];
      for (const filter of filters) {
        const { col, val } = filter;
        if (!isSafeIdentifier(col)) {
          throw new Error(`Invalid column identifier in filter: ${col}`);
        }
        if (val === null) {
          parts.push(`"${col}" IS NULL`);
        } else {
          parts.push(`"${col}" = $${paramCounter++}`);
          queryParams.push(sanitizeParam(table, col, val));
        }
      }
      return ` WHERE ${parts.join(' AND ')}`;
    };

    if (method === 'SELECT') {
      // Validate selects
      if (!isSafeSelect(selects)) {
        return NextResponse.json({ error: `Invalid columns selected` }, { status: 400 });
      }

      queryText = `SELECT ${selects} FROM "${table}"`;
      queryText += buildWhereClause();

      if (orderCol) {
        if (!isSafeIdentifier(orderCol)) {
          return NextResponse.json({ error: `Invalid order column: ${orderCol}` }, { status: 400 });
        }
        queryText += ` ORDER BY "${orderCol}" ${orderAscending ? 'ASC' : 'DESC'}`;
      }

      if (limitCount !== undefined && limitCount !== null) {
        const limitNum = Number(limitCount);
        if (!isNaN(limitNum)) {
          queryText += ` LIMIT $${paramCounter++}`;
          queryParams.push(limitNum);
        }
      }

    } else if (method === 'INSERT') {
      if (!insertRows || insertRows.length === 0) {
        return NextResponse.json({ error: 'No rows to insert' }, { status: 400 });
      }

      // Check first row keys for columns
      const firstRow = insertRows[0];
      const columns = Object.keys(firstRow);
      for (const col of columns) {
        if (!isSafeIdentifier(col)) {
          return NextResponse.json({ error: `Invalid column in insert: ${col}` }, { status: 400 });
        }
      }

      const colList = columns.map(c => `"${c}"`).join(', ');
      const valPlaceholderRows: string[] = [];

      for (const row of insertRows) {
        const rowPlaceholders: string[] = [];
        for (const col of columns) {
          rowPlaceholders.push(`$${paramCounter++}`);
          queryParams.push(sanitizeParam(table, col, row[col]));
        }
        valPlaceholderRows.push(`(${rowPlaceholders.join(', ')})`);
      }

      queryText = `INSERT INTO "${table}" (${colList}) VALUES ${valPlaceholderRows.join(', ')} RETURNING *`;

    } else if (method === 'UPSERT') {
      if (!insertRows || insertRows.length === 0) {
        return NextResponse.json({ error: 'No rows to upsert' }, { status: 400 });
      }

      const firstRow = insertRows[0];
      const columns = Object.keys(firstRow);
      for (const col of columns) {
        if (!isSafeIdentifier(col)) {
          return NextResponse.json({ error: `Invalid column in upsert: ${col}` }, { status: 400 });
        }
      }

      const colList = columns.map(c => `"${c}"`).join(', ');
      const valPlaceholderRows: string[] = [];

      for (const row of insertRows) {
        const rowPlaceholders: string[] = [];
        for (const col of columns) {
          rowPlaceholders.push(`$${paramCounter++}`);
          queryParams.push(sanitizeParam(table, col, row[col]));
        }
        valPlaceholderRows.push(`(${rowPlaceholders.join(', ')})`);
      }

      const conflictKey = table === 'website_config' ? 'key' : 'id';
      const updateCols = columns.filter(c => c !== conflictKey);
      const doUpdateSet = updateCols.map(c => `"${c}" = EXCLUDED."${c}"`).join(', ');

      queryText = `INSERT INTO "${table}" (${colList}) VALUES ${valPlaceholderRows.join(', ')}`;
      if (doUpdateSet.length > 0) {
        queryText += ` ON CONFLICT ("${conflictKey}") DO UPDATE SET ${doUpdateSet}`;
      } else {
        queryText += ` ON CONFLICT ("${conflictKey}") DO NOTHING`;
      }
      queryText += ' RETURNING *';

    } else if (method === 'UPDATE') {
      if (!updatePayload || Object.keys(updatePayload).length === 0) {
        return NextResponse.json({ error: 'No update payload provided' }, { status: 400 });
      }

      const updateCols = Object.keys(updatePayload);
      const setParts: string[] = [];

      for (const col of updateCols) {
        if (!isSafeIdentifier(col)) {
          return NextResponse.json({ error: `Invalid column in update: ${col}` }, { status: 400 });
        }
        setParts.push(`"${col}" = $${paramCounter++}`);
        queryParams.push(sanitizeParam(table, col, updatePayload[col]));
      }

      queryText = `UPDATE "${table}" SET ${setParts.join(', ')}`;
      queryText += buildWhereClause();
      queryText += ' RETURNING *';

    } else if (method === 'DELETE') {
      queryText = `DELETE FROM "${table}"`;
      queryText += buildWhereClause();
    } else {
      return NextResponse.json({ error: `Unsupported method: ${method}` }, { status: 400 });
    }

    // Execute query
    const client = await pool.connect();
    try {
      const result = await client.query(queryText, queryParams);
      let data: any = result.rows;

      if (isSingle) {
        data = result.rows.length > 0 ? result.rows[0] : null;
      }

      return NextResponse.json(data);
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Database proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
