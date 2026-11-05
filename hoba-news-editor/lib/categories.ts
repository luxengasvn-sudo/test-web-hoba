import { supabase } from '@/lib/supabase';

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at?: string;
}

export const DEFAULT_NEWS_CATEGORIES: NewsCategory[] = [
  { id: 'cat-1', name: 'Hoạt động hiệp hội', slug: 'hoat-dong-hiep-hoi', display_order: 1 },
  { id: 'cat-2', name: 'Bản tin chuyên ngành', slug: 'ban-tin-chuyen-nganh', display_order: 2 },
  { id: 'cat-3', name: 'Kỹ thuật - An toàn', slug: 'ky-thuat-an-toan', display_order: 3 },
];

export async function getNewsCategories(): Promise<NewsCategory[]> {
  if (!supabase) return DEFAULT_NEWS_CATEGORIES;

  try {
    const { data, error } = await supabase
      .from('news_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Cannot fetch news_categories, falling back to default:', error);
      return DEFAULT_NEWS_CATEGORIES;
    }

    return data as NewsCategory[];
  } catch (err) {
    console.error('getNewsCategories error:', err);
    return DEFAULT_NEWS_CATEGORIES;
  }
}

export async function createNewsCategory(category: {
  name: string;
  slug: string;
  display_order: number;
}): Promise<NewsCategory> {
  if (!supabase) {
    return {
      id: String(Date.now()),
      ...category
    };
  }

  const { data, error } = await supabase
    .from('news_categories')
    .insert([category])
    .select()
    .single();

  if (error) throw error;
  return data as NewsCategory;
}

export async function updateNewsCategory(
  id: string,
  oldName: string,
  category: { name: string; slug: string; display_order: number }
): Promise<void> {
  if (!supabase) return;

  // 1. Update category
  const { error: catError } = await supabase
    .from('news_categories')
    .update({
      name: category.name,
      slug: category.slug,
      display_order: category.display_order
    })
    .eq('id', id);

  if (catError) throw catError;

  // 2. Cascade rename news articles if category name changed
  if (oldName !== category.name) {
    const { error: newsError } = await supabase
      .from('news')
      .update({ category: category.name })
      .eq('category', oldName);

    if (newsError) {
      console.error('Failed to cascade update news category:', newsError);
    }
  }
}

export async function deleteNewsCategory(
  id: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: true };

  // 1. Check if any news is using this category
  const { count, data: newsWithCat, error: countError } = await supabase
    .from('news')
    .select('id')
    .eq('category', name);

  if (countError) {
    return { success: false, error: countError.message };
  }

  const articleCount = count !== undefined && count !== null ? count : (Array.isArray(newsWithCat) ? newsWithCat.length : 0);

  if (articleCount > 0) {
    return {
      success: false,
      error: `Chuyên mục đang có ${articleCount} bài viết. Vui lòng chuyển các bài viết sang chuyên mục khác trước khi xóa.`
    };
  }

  // 2. Perform delete
  const { error: delError } = await supabase
    .from('news_categories')
    .delete()
    .eq('id', id);

  if (delError) {
    return { success: false, error: delError.message };
  }

  return { success: true };
}
