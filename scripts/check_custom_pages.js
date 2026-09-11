const { Client } = require('pg');

async function checkCustomPages() {
  const client = new Client({
    connectionString: 'postgresql://user_dc4dbdfce69c:kFm4SnCtamVOG4I5kupsG6bBxkgAAY8h@tinhgon.xyz:30013/hoba_test'
  });
  await client.connect();
  const res = await client.query("SELECT key, value FROM website_config WHERE key = 'custom_pages'");
  console.log('custom_pages value type:', typeof res.rows[0]?.value);
  console.log('custom_pages value:', JSON.stringify(res.rows[0]?.value, null, 2));
  await client.end();
}

checkCustomPages().catch(console.error);
