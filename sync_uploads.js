const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://user_dc4dbdfce69c:kFm4SnCtamVOG4I5kupsG6bBxkgAAY8h@tinhgon.xyz:30013/hoba_test';
const pool = new Pool({ connectionString });

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf'
};

async function ensureTableExists() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS uploaded_files (
      path TEXT PRIMARY KEY,
      data BYTEA NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

function getFilesRecursively(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const absolutePath = path.join(dir, file);
    if (fs.statSync(absolutePath).isDirectory()) {
      getFilesRecursively(absolutePath, fileList);
    } else {
      fileList.push(absolutePath);
    }
  }
  return fileList;
}

async function main() {
  console.log('Connecting to database...');
  await ensureTableExists();
  
  const projectUploadDir = path.join(__dirname, 'public', 'uploads');
  
  if (!fs.existsSync(projectUploadDir)) {
    console.error('Local uploads directory not found:', projectUploadDir);
    process.exit(1);
  }

  const files = getFilesRecursively(projectUploadDir);
  console.log(`Found ${files.length} local upload files.`);

  for (const file of files) {
    const relativePath = path.relative(projectUploadDir, file).replace(/\\/g, '/');
    const ext = path.extname(file).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    const buffer = fs.readFileSync(file);

    console.log(`Syncing ${relativePath} (${mimeType})...`);
    await pool.query(
      `INSERT INTO uploaded_files (path, data, mime_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (path) DO UPDATE SET data = $2, mime_type = $3`,
      [relativePath, buffer, mimeType]
    );
  }

  console.log('All local uploads successfully synced to PostgreSQL!');
  await pool.end();
}

main().catch(err => {
  console.error('Error during sync:', err);
  process.exit(1);
});
