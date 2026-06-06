import pool from './postgres';

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

function isSafeIdentifier(str: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(str);
}

function isSafeSelect(str: string): boolean {
  return /^[a-zA-Z0-9_,\s\*]+$/.test(str);
}

function sanitizeParam(table: string, col: string, val: any): any {
  if (table === 'website_config' && col === 'value' && typeof val === 'object' && val !== null) {
    return JSON.stringify(val);
  }
  return val;
}

export async function executeDirectQuery(body: any) {
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

  if (!table || !WHITELIST_TABLES.includes(table)) {
    throw new Error(`Invalid or unauthorized table: ${table}`);
  }

  let queryText = '';
  const queryParams: any[] = [];
  let paramCounter = 1;

  const buildWhereClause = () => {
    if (!filters || filters.length === 0) return '';
    const parts: string[] = [];
    for (const filter of filters) {
      const { col, val, op = 'eq' } = filter;
      if (!isSafeIdentifier(col)) {
        throw new Error(`Invalid column identifier in filter: ${col}`);
      }
      if (val === null) {
        if (op === 'neq') {
          parts.push(`"${col}" IS NOT NULL`);
        } else {
          parts.push(`"${col}" IS NULL`);
        }
      } else {
        if (op === 'neq') {
          parts.push(`"${col}" != $${paramCounter++}`);
        } else {
          parts.push(`"${col}" = $${paramCounter++}`);
        }
        queryParams.push(sanitizeParam(table, col, val));
      }
    }
    return ` WHERE ${parts.join(' AND ')}`;
  };

  if (method === 'SELECT') {
    if (!isSafeSelect(selects)) {
      throw new Error(`Invalid columns selected`);
    }

    queryText = `SELECT ${selects} FROM "${table}"`;
    queryText += buildWhereClause();

    if (orderCol) {
      if (!isSafeIdentifier(orderCol)) {
        throw new Error(`Invalid order column: ${orderCol}`);
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
      throw new Error('No rows to insert');
    }

    const firstRow = insertRows[0];
    const columns = Object.keys(firstRow);
    for (const col of columns) {
      if (!isSafeIdentifier(col)) {
        throw new Error(`Invalid column in insert: ${col}`);
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
      throw new Error('No rows to upsert');
    }

    const firstRow = insertRows[0];
    const columns = Object.keys(firstRow);
    for (const col of columns) {
      if (!isSafeIdentifier(col)) {
        throw new Error(`Invalid column in upsert: ${col}`);
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
      throw new Error('No update payload provided');
    }

    const updateCols = Object.keys(updatePayload);
    const setParts: string[] = [];

    for (const col of updateCols) {
      if (!isSafeIdentifier(col)) {
        throw new Error(`Invalid column in update: ${col}`);
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
    throw new Error(`Unsupported method: ${method}`);
  }

  const client = await pool.connect();
  try {
    const result = await client.query(queryText, queryParams);
    let data: any = result.rows;

    if (isSingle) {
      data = result.rows.length > 0 ? result.rows[0] : null;
    }

    return data;
  } finally {
    client.release();
  }
}
