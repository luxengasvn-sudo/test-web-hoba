import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

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
  '.webp': 'image/webp'
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

    if (!fs.existsSync(destinationPath)) {
      return new Response('File Not Found', { status: 404 });
    }

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
