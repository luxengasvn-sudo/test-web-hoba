const { Client } = require('pg');

async function runAudit() {
  const client = new Client({
    connectionString: 'postgresql://user_dc4dbdfce69c:kFm4SnCtamVOG4I5kupsG6bBxkgAAY8h@tinhgon.xyz:30013/hoba_test'
  });

  await client.connect();
  console.log('Connected to PostgreSQL database.');

  // 1. Audit members empty tax_code
  const emptyTaxMembers = await client.query(`
    SELECT id, company_name, tax_code 
    FROM members 
    WHERE tax_code IS NOT NULL AND trim(tax_code) = ''
  `);
  console.log(`Found ${emptyTaxMembers.rows.length} members with empty string tax_code:`, emptyTaxMembers.rows);

  if (emptyTaxMembers.rows.length > 0) {
    const updateRes = await client.query(`
      UPDATE members 
      SET tax_code = NULL 
      WHERE tax_code IS NOT NULL AND trim(tax_code) = ''
    `);
    console.log(`Updated ${updateRes.rowCount} members to have tax_code = NULL.`);
  }

  // 2. Audit documents table
  const docs = await client.query(`SELECT id, code, title, file_url, description FROM documents`);
  console.log('\nCurrent documents in DB:');
  for (const d of docs.rows) {
    console.log(`- [${d.code}] ${d.title} | file_url: ${d.file_url}`);
  }

  // Clean title for 105/2025/ND-CP if it contains TEST
  const testDoc = docs.rows.find(d => d.code === '105/2025/NĐ-CP' && d.title.includes('TEST'));
  if (testDoc) {
    await client.query(`
      UPDATE documents 
      SET title = 'Nghị định 105/2025/NĐ-CP quy định chi tiết Luật Phòng cháy, chữa cháy và cứu nạn, cứu hộ',
          description = 'Nghị định quy định chi tiết một số điều và biện pháp thi hành Luật Phòng cháy, chữa cháy và cứu nạn, cứu hộ đối với các cơ sở kinh doanh, chiết nạp, tồn chứa khí LPG.'
      WHERE id = $1
    `, [testDoc.id]);
    console.log('Cleaned title and description for 105/2025/NĐ-CP in DB.');
  }

  // 3. Verify total members and statuses
  const memberCounts = await client.query(`
    SELECT status, count(*) as count 
    FROM members 
    GROUP BY status
  `);
  console.log('\nMember count by status:', memberCounts.rows);

  // 4. Verify website_config keys
  const configKeys = await client.query(`SELECT key FROM website_config ORDER BY key`);
  console.log('\nWebsite config keys:', configKeys.rows.map(r => r.key));

  await client.end();
  console.log('\nAudit and fix script completed successfully.');
}

runAudit().catch(err => {
  console.error('Audit script error:', err);
  process.exit(1);
});
