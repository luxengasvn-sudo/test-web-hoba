import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pool from '@/lib/postgres';

const MIME_TYPES: { [key: string]: string } = {
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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const filePathStr = formData.get('path') as string | null;

    if (!file || !filePathStr) {
      return NextResponse.json({ error: 'Missing file or path' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const destinationPath = path.resolve(uploadDir, filePathStr);

    // Security check: prevent directory traversal
    const relative = path.relative(uploadDir, destinationPath);
    const isSafe = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    if (!isSafe) {
      return NextResponse.json({ error: 'Unauthorized path traversal attempt' }, { status: 400 });
    }

    // Ensure directory exists
    const destinationDir = path.dirname(destinationPath);
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    // Write file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(destinationPath, buffer);

    // Save to Database permanently
    try {
      await ensureTableExists();
      const ext = path.extname(filePathStr).toLowerCase();
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
      await pool.query(
        `INSERT INTO uploaded_files (path, data, mime_type)
         VALUES ($1, $2, $3)
         ON CONFLICT (path) DO UPDATE SET data = $2, mime_type = $3`,
        [filePathStr, buffer, mimeType]
      );
      console.log(`[Storage Proxy] Successfully persisted file to DB: ${filePathStr}`);
    } catch (dbError) {
      console.error('[Storage Proxy] Failed to persist file to DB:', dbError);
      // We don't fail the request if DB write fails, but log it
    }

    console.log(`[Storage Proxy] Successfully uploaded file to disk: ${destinationPath}`);
    return NextResponse.json({ success: true, path: filePathStr });

  } catch (error: any) {
    console.error('[Storage Proxy] Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { paths = [] } = await req.json();
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const deletedFiles: string[] = [];

    await ensureTableExists();

    for (const p of paths) {
      if (!p) continue;
      const destinationPath = path.resolve(uploadDir, p);
      
      // Security check
      const relative = path.relative(uploadDir, destinationPath);
      const isSafe = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
      
      if (isSafe && fs.existsSync(destinationPath)) {
        fs.unlinkSync(destinationPath);
        deletedFiles.push(p);
      }

      // Delete from DB as well
      try {
        await pool.query('DELETE FROM uploaded_files WHERE path = $1', [p]);
      } catch (dbError) {
        console.error(`[Storage Proxy] Failed to delete file from DB: ${p}`, dbError);
      }
    }

    console.log(`[Storage Proxy] Successfully deleted files:`, deletedFiles);
    return NextResponse.json({ success: true, deleted: deletedFiles });

  } catch (error: any) {
    console.error('[Storage Proxy] Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
