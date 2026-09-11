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

interface RouteParams {
  params: Promise<{
    path: string[];
  }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { path: pathParams } = await params;
    if (!pathParams || pathParams.length === 0) {
      return new Response('Not Found', { status: 404 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const destinationPath = path.resolve(uploadDir, ...pathParams);

    // Security check: prevent directory traversal
    const relative = path.relative(uploadDir, destinationPath);
    const isSafe = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    if (!isSafe) {
      return new Response('Forbidden', { status: 403 });
    }

    const destinationDir = path.dirname(destinationPath);

    // If file does NOT exist on the local disk
    if (!fs.existsSync(destinationPath)) {
      // 1. Try to fetch from persistent PostgreSQL database
      try {
        const dbPath = pathParams.join('/');
        
        // Ensure table exists in case it hasn't been created yet
        await pool.query(`
          CREATE TABLE IF NOT EXISTS uploaded_files (
            path TEXT PRIMARY KEY,
            data BYTEA NOT NULL,
            mime_type VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          )
        `);

        const dbFile = await pool.query(
          'SELECT data, mime_type FROM uploaded_files WHERE path = $1',
          [dbPath]
        );

        if (dbFile.rows.length > 0) {
          const fileBuffer = dbFile.rows[0].data;
          const contentType = dbFile.rows[0].mime_type;

          // Cache file back to local disk so future requests serve directly from disk
          try {
            if (!fs.existsSync(destinationDir)) {
              fs.mkdirSync(destinationDir, { recursive: true });
            }
            fs.writeFileSync(destinationPath, fileBuffer);
            console.log(`[Uploads Server] Successfully restored and cached file from DB to disk: ${destinationPath}`);
          } catch (cacheError) {
            console.error('[Uploads Server] Failed to cache file to disk:', cacheError);
          }

          return new Response(fileBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable'
            }
          });
        }
      } catch (dbError) {
        console.error('[Uploads Server] Database retrieval error:', dbError);
      }

      // 2. In development, fallback redirect to production url so local testing doesn't break
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        return NextResponse.redirect(`https://hobalpg.vn/uploads/${pathParams.join('/')}`);
      }

      return new Response('File Not Found', { status: 404 });
    }

    // Serving from local disk
    const fileBuffer = fs.readFileSync(destinationPath);
    const ext = path.extname(destinationPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });

  } catch (error: any) {
    console.error('[Uploads Server] Error serving file:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
