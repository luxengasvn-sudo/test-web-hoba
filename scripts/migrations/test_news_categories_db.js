const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: 'postgresql://user_dc4dbdfce69c:kFm4SnCtamVOG4I5kupsG6bBxkgAAY8h@tinhgon.xyz:30013/hoba_test'
  });
  await client.connect();

  const res = await client.query('SELECT * FROM news_categories ORDER BY display_order ASC');
  console.log(`Found ${res.rows.length} categories:`, res.rows.map(r => ({ name: r.name, slug: r.slug, order: r.display_order })));

  if (res.rows.length < 3) {
    throw new Error('Categories count is less than 3');
  }
  await client.end();
  console.log('PASS: Database migration and seed verified.');
}

test().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
