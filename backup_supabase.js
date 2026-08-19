const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Fetch credentials from environment or fallback to your current Supabase settings
const supabaseUrl = 'https://lcfeznwqexpmlsoiykxh.supabase.co';
const supabaseAnonKey = 'sb_publishable_yGNQveln6jXUzxVCCqFRXg_EGlQEBN-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tables = [
  'website_config',
  'news',
  'documents',
  'members',
  'chapters',
  'chapter_leadership',
  'contact_messages'
];

async function runBackup() {
  console.log('=== STARTING DATABASE BACKUP FROM SUPABASE ===');
  const backup = {};
  
  for (const table of tables) {
    console.log(`Backing up table: ${table}...`);
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.error(`✗ Error backing up table ${table}:`, error.message);
        backup[table] = [];
      } else {
        backup[table] = data || [];
        console.log(`✓ Table ${table} backed up successfully (${backup[table].length} rows)`);
      }
    } catch (err) {
      console.error(`✗ System error backing up table ${table}:`, err.message);
      backup[table] = [];
    }
  }

  // Save JSON backup
  fs.writeFileSync('backup_data.json', JSON.stringify(backup, null, 2));
  console.log('\n=== BACKUP COMPLETED! Saved to backup_data.json ===');
}

runBackup();
