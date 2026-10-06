const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: 'postgresql://user_dc4dbdfce69c:kFm4SnCtamVOG4I5kupsG6bBxkgAAY8h@tinhgon.xyz:30013/hoba_test'
  });
  await client.connect();

  console.log('Connected to PostgreSQL database.');

  await client.query(`
    CREATE TABLE IF NOT EXISTS news_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      slug VARCHAR(255) NOT NULL UNIQUE,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_news_categories_order ON news_categories(display_order ASC);
    CREATE INDEX IF NOT EXISTS idx_news_categories_slug ON news_categories(slug);
  `);
  console.log('Table news_categories created or verified.');

  const initialCategories = [
    { name: 'Hoạt động hiệp hội', slug: 'hoat-dong-hiep-hoi', order: 1 },
    { name: 'Bản tin chuyên ngành', slug: 'ban-tin-chuyen-nganh', order: 2 },
    { name: 'Kỹ thuật - An toàn', slug: 'ky-thuat-an-toan', order: 3 }
  ];

  for (const cat of initialCategories) {
    await client.query(`
      INSERT INTO news_categories (name, slug, display_order)
      VALUES ($1, $2, $3)
      ON CONFLICT (name) DO NOTHING;
    `, [cat.name, cat.slug, cat.order]);
  }

  console.log('Seeded initial news categories successfully.');
  await client.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
