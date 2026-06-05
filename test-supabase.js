const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lcfeznwqexpmlsoiykxh.supabase.co';
const supabaseAnonKey = 'sb_publishable_yGNQveln6jXUzxVCCqFRXg_EGlQEBN-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Supabase connection...');
  try {
    const { data: news, error } = await supabase
      .from('news')
      .select('id, title, slug, status, publish_date');
    
    if (error) {
      console.error('Error fetching news:', error);
      return;
    }
    
    console.log(`Successfully fetched ${news.length} news items:`);
    console.log(JSON.stringify(news, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

test();
