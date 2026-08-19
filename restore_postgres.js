const { Pool } = require('pg');
const fs = require('fs');

// Target PostgreSQL connection string
const connectionString = 'postgresql://user_dc4dbdfce69c:kFm4SnCtamVOG4I5kupsG6bBxkgAAY8h@tinhgon.xyz:30013/hoba_test';

const pool = new Pool({ connectionString });

function escapeIdentifier(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

async function runRestore() {
  if (!fs.existsSync('backup_data.json')) {
    console.error('✗ backup_data.json not found! Please run backup_supabase.js first.');
    return;
  }

  const backup = JSON.parse(fs.readFileSync('backup_data.json', 'utf8'));
  console.log('=== STARTING RESTORE TO POSTGRESQL ===');

  const db = await pool.connect();

  try {
    // Order tables correctly to satisfy database dependencies
    const tablesOrder = [
      'website_config',
      'chapters',
      'chapter_leadership',
      'members',
      'news',
      'documents',
      'contact_messages'
    ];

    for (const table of tablesOrder) {
      const rows = backup[table];
      if (!rows || rows.length === 0) {
        console.log(`Table ${table} has no data in backup. Skipping.`);
        continue;
      }

      console.log(`Restoring ${rows.length} rows to table ${table}...`);
      
      // Clear existing records first to avoid duplicate conflicts
      await db.query(`DELETE FROM ${escapeIdentifier(table)}`);

      for (const row of rows) {
        // Special mapping for JSONB fields
        if (table === 'website_config' && typeof row.value === 'object') {
          row.value = JSON.stringify(row.value);
        }

        const columns = Object.keys(row);
        const escapedColumns = columns.map(escapeIdentifier).join(', ');
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
        const values = Object.values(row);

        const sql = `INSERT INTO ${escapeIdentifier(table)} (${escapedColumns}) VALUES (${placeholders})`;
        await db.query(sql, values);
      }
      console.log(`✓ Table ${table} restored successfully.`);
    }

    console.log('\n=== RESTORE COMPLETED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('✗ Error during restore:', err.message);
  } finally {
    db.release();
    await pool.end();
  }
}

runRestore();
