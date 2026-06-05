import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    console.log(`[Storage Proxy] Successfully uploaded file to: ${destinationPath}`);
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
    }

    console.log(`[Storage Proxy] Successfully deleted files:`, deletedFiles);
    return NextResponse.json({ success: true, deleted: deletedFiles });

  } catch (error: any) {
    console.error('[Storage Proxy] Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
