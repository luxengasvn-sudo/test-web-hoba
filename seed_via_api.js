const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment configuration
const envPath = path.join(__dirname, '.env.local');
let supabaseUrl = 'https://lcfeznwqexpmlsoiykxh.supabase.co';
let apiKey = 'sb_publishable_yGNQveln6jXUzxVCCqFRXg_EGlQEBN-';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*([^\r\n]*)/);
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*([^\r\n]*)/);
  if (urlMatch && urlMatch[1]) supabaseUrl = urlMatch[1].trim().replace(/['"]/g, '');
  if (keyMatch && keyMatch[1]) apiKey = keyMatch[1].trim().replace(/['"]/g, '');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', apiKey.substring(0, 10) + '...');

// Helper to make POST/upsert request to Supabase REST API
function upsertData(table, payload) {
  return new Promise((resolve, reject) => {
    const url = `${supabaseUrl}/rest/v1/${table}`;
    const postData = JSON.stringify(payload);

    const options = {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(url, options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, statusCode: res.statusCode });
        } else {
          resolve({ success: false, statusCode: res.statusCode, error: responseBody });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function runSeeder() {
  const initialDataPath = path.join(__dirname, 'src/lib/initialData.json');
  if (!fs.existsSync(initialDataPath)) {
    console.error('initialData.json not found!');
    return;
  }

  const rawData = fs.readFileSync(initialDataPath, 'utf8');
  const data = JSON.parse(rawData);

  console.log('Starting data seed via Supabase REST API...\n');

  // 1. Seed website_config
  const configKeys = {
    'hoba_website_config_general': 'general',
    'hoba_website_config_aboutpage': 'aboutpage',
    'hoba_website_config_homepage': 'homepage',
    'hoba_website_config_memberspage': 'memberspage',
    'hoba_website_config_register': 'registerpage',
    'hoba_website_committee_ban-chap-hanh': 'hoba_website_committee_ban-chap-hanh',
    'hoba_website_committee_ban-kiem-tra': 'hoba_website_committee_ban-kiem-tra',
    'hoba_website_committee_ban-thuong-vu': 'hoba_website_committee_ban-thuong-vu'
  };

  const configPayloads = [];

  for (const [jsonKey, dbKey] of Object.entries(configKeys)) {
    if (data[jsonKey]) {
      let valJson;
      try {
        valJson = JSON.parse(data[jsonKey]);
      } catch (e) {
        valJson = data[jsonKey];
      }
      configPayloads.push({ key: dbKey, value: valJson });
    }
  }

  if (data.hoba_website_custom_pages) {
    try {
      const pages = JSON.parse(data.hoba_website_custom_pages);
      configPayloads.push({ key: 'custom_pages', value: { pages } });
    } catch (e) {
      console.error('Error parsing custom pages:', e);
    }
  }

  // Add defaults for events, library, featured_members
  configPayloads.push({ key: 'events', value: [] });
  configPayloads.push({ key: 'library', value: [] });
  configPayloads.push({ key: 'featured_members', value: [] });

  console.log(`Upserting ${configPayloads.length} configuration keys into website_config...`);
  const configResult = await upsertData('website_config', configPayloads);
  if (configResult.success) {
    console.log('✓ website_config seeded successfully.');
  } else {
    console.error('✗ website_config seed failed:', configResult.error);
  }

  // 2. Seed members
  if (data.hoba_website_members) {
    try {
      const members = JSON.parse(data.hoba_website_members);
      // Clean up fields to match DB table schema exactly
      const cleanMembers = members.map(m => ({
        id: m.id || undefined,
        company_name: m.company_name,
        tax_code: m.tax_code,
        address: m.address,
        phone: m.phone,
        email: m.email,
        business_type: m.business_type || 'Phân phối & Bán lẻ',
        representative_name: m.representative_name,
        representative_role: m.representative_role,
        representative_email: m.representative_email,
        representative_phone: m.representative_phone,
        status: m.status || 'Pending',
        created_at: m.created_at || new Date().toISOString(),
        association_role: m.association_role || 'Hội viên chính thức',
        chapter_role: m.chapter_role || null,
        join_date: m.join_date || new Date().toISOString().split('T')[0],
        logo_url: m.logo_url || null,
        representative_avatar_url: m.representative_avatar_url || null
      }));

      // PostgREST handles batch upserts cleanly. We can chunk them in batches of 30 to be extremely safe.
      const chunkSize = 30;
      console.log(`\nUpserting ${cleanMembers.length} members in chunks...`);
      for (let i = 0; i < cleanMembers.length; i += chunkSize) {
        const chunk = cleanMembers.slice(i, i + chunkSize);
        const result = await upsertData('members', chunk);
        if (result.success) {
          console.log(`✓ Seeded members chunk ${Math.floor(i / chunkSize) + 1} (${chunk.length} items)`);
        } else {
          console.error(`✗ Failed seeding members chunk ${Math.floor(i / chunkSize) + 1}:`, result.error);
        }
      }
    } catch (e) {
      console.error('Error seeding members:', e);
    }
  }

  // 3. Seed documents
  if (data.hoba_website_documents) {
    try {
      const docs = JSON.parse(data.hoba_website_documents);
      const cleanDocs = docs.map(d => ({
        id: d.id || undefined,
        code: d.code,
        title: d.title,
        category: d.category || 'Quy chuẩn',
        issuer: d.issuer,
        file_url: d.file_url || null,
        file_size: d.file_size || null,
        publish_date: d.publish_date || new Date().toISOString().split('T')[0],
        created_at: d.created_at || new Date().toISOString(),
        description: d.description || null
      }));

      console.log(`\nUpserting ${cleanDocs.length} documents...`);
      const result = await upsertData('documents', cleanDocs);
      if (result.success) {
        console.log('✓ documents seeded successfully.');
      } else {
        console.error('✗ documents seed failed:', result.error);
      }
    } catch (e) {
      console.error('Error seeding documents:', e);
    }
  }

  console.log('\nSeeding completed successfully!');
}

runSeeder();
