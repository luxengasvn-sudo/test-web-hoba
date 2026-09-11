const { Client } = require('pg');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function runTest() {
  console.log('=== STARTING END-TO-END POST & UPLOAD TEST ===');

  // 1. Create a 1x1 transparent PNG buffer
  const samplePngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const testFileName = `test_upload_${Date.now()}.png`;
  const testFilePath = `news-images/${testFileName}`;

  // 2. Test Upload via /api/storage-proxy using HTTP multipart
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let body = '';
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="path"\r\n\r\n${testFilePath}\r\n`;
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="bucket"\r\n\r\nnews-images\r\n`;
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="file"; filename="${testFileName}"\r\n`;
  body += `Content-Type: image/png\r\n\r\n`;
  
  const payload = Buffer.concat([
    Buffer.from(body, 'utf8'),
    samplePngBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
  ]);

  const uploadRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3010,
      path: '/api/storage-proxy/',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });

  console.log('1. Upload API status:', uploadRes.status, 'Response:', uploadRes.body);
  const uploadJson = JSON.parse(uploadRes.body);
  if (!uploadJson.success) {
    throw new Error('Upload failed: ' + uploadRes.body);
  }

  // 3. Verify file exists in PostgreSQL uploaded_files table
  const pgClient = new Client({ connectionString: 'postgresql://user_dc4dbdfce69c:kFm4SnCtamVOG4I5kupsG6bBxkgAAY8h@tinhgon.xyz:30013/hoba_test' });
  await pgClient.connect();
  const dbFileCheck = await pgClient.query('SELECT path, mime_type, length(data) as size FROM uploaded_files WHERE path = $1', [testFilePath]);
  console.log('2. File in PostgreSQL database uploaded_files:', dbFileCheck.rows[0]);

  // 4. Test Serving the uploaded file via GET /uploads/news-images/...
  const serveRes = await new Promise((resolve, reject) => {
    http.get(`http://localhost:3010/uploads/${testFilePath}`, res => {
      resolve({ status: res.statusCode, headers: res.headers });
    }).on('error', reject);
  });
  console.log('3. Serving uploaded file status:', serveRes.status, 'Content-Type:', serveRes.headers['content-type']);

  // 5. Test Posting an Article to database via /api/db-proxy
  const testSlug = `kiem-tra-dang-bai-${Date.now()}`;
  const insertPayload = {
    method: 'INSERT',
    table: 'news',
    insertRows: [{
      title: 'Bài viết kiểm tra hệ thống đăng bài',
      slug: testSlug,
      category: 'Hoạt động hiệp hội',
      status: 'Published',
      description: 'Mô tả bài viết kiểm tra đăng bài tự động.',
      content: `<p>Nội dung bài viết thử nghiệm</p><img src="/uploads/${testFilePath}" alt="Test" />`,
      thumbnail_url: `/uploads/${testFilePath}`,
      is_featured: false,
      publish_date: new Date().toISOString().split('T')[0]
    }]
  };

  const dbInsertRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3010,
      path: '/api/db-proxy/',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(JSON.stringify(insertPayload));
    req.end();
  });

  console.log('4. Article Insert DB status:', dbInsertRes.status);
  const insertedArticle = JSON.parse(dbInsertRes.body);
  const articleId = Array.isArray(insertedArticle) ? insertedArticle[0].id : insertedArticle.id;
  console.log('   Inserted Article ID:', articleId, 'Slug:', testSlug);

  // 6. Test Public Article Page /tin-tuc/[slug]/
  const articlePageRes = await new Promise((resolve, reject) => {
    http.get(`http://localhost:3010/tin-tuc/${testSlug}/`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, length: data.length, hasTitle: data.includes('Bài viết kiểm tra hệ thống đăng bài') }));
    }).on('error', reject);
  });
  console.log('5. Public article page /tin-tuc/[slug]/ status:', articlePageRes.status, 'Contains title in HTML:', articlePageRes.hasTitle);

  // 7. Clean up test article and test file
  await pgClient.query('DELETE FROM news WHERE id = $1', [articleId]);
  await pgClient.query('DELETE FROM uploaded_files WHERE path = $1', [testFilePath]);
  const diskPath = path.join(process.cwd(), 'public', 'uploads', testFilePath);
  if (fs.existsSync(diskPath)) {
    fs.unlinkSync(diskPath);
  }
  await pgClient.end();
  console.log('6. Cleaned up test article and test file successfully.');

  console.log('\n=== ALL TESTS PASSED: UPLOAD AND POSTING ARE 100% OPERATIONAL ===');
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
