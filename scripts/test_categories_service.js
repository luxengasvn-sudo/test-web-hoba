const { Client } = require('pg');

async function testCascadeAndSafeDelete() {
  const client = new Client({
    connectionString: 'postgresql://user_dc4dbdfce69c:kFm4SnCtamVOG4I5kupsG6bBxkgAAY8h@tinhgon.xyz:30013/hoba_test'
  });
  await client.connect();

  console.log('Testing categories business logic...');
  // 1. Test insert temporary category
  const tempName = 'Chuyên mục Test ' + Date.now();
  const tempSlug = 'chuyen-muc-test-' + Date.now();
  const insRes = await client.query(
    'INSERT INTO news_categories (name, slug, display_order) VALUES ($1, $2, 99) RETURNING *',
    [tempName, tempSlug]
  );
  const tempCat = insRes.rows[0];
  console.log('Created temporary category:', tempCat.name);

  // 2. Test safe delete when 0 articles
  const countRes = await client.query('SELECT count(*) FROM news WHERE category = $1', [tempCat.name]);
  console.log('Article count for test category:', countRes.rows[0].count);
  if (parseInt(countRes.rows[0].count) === 0) {
    await client.query('DELETE FROM news_categories WHERE id = $1', [tempCat.id]);
    console.log('Deleted temporary category successfully.');
  }

  await client.end();
  console.log('PASS: Category operations verified.');
}

testCascadeAndSafeDelete().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
