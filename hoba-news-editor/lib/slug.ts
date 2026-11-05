import { supabase } from './supabase';

/**
 * Converts a Vietnamese string to an SEO-friendly slug.
 */
export function toSlug(str: string): string {
  if (!str) return '';
  let slug = str.toLowerCase();
  
  // Remove Vietnamese accents
  slug = slug.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a');
  slug = slug.replace(/[èéẹẻẽêềếệểễ]/g, 'e');
  slug = slug.replace(/[ìíịỉĩ]/g, 'i');
  slug = slug.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o');
  slug = slug.replace(/[ùúụủũưừứựửữ]/g, 'u');
  slug = slug.replace(/[ỳýỵỷỹ]/g, 'y');
  slug = slug.replace(/đ/g, 'd');
  
  // Remove special characters except alphanumeric, spaces, and hyphens
  slug = slug.replace(/([^a-z0-9\s-]|_)+/g, '');
  
  // Replace spaces and underscores with a single hyphen
  slug = slug.replace(/[\s_]+/g, '-');
  
  // Remove consecutive hyphens
  slug = slug.replace(/-+/g, '-');
  
  // Trim hyphens from start and end
  slug = slug.trim().replace(/^-+|-+$/g, '');
  
  return slug;
}

/**
 * Checks if a news slug is already taken in the Supabase news table.
 * If currentId is provided, excludes that record from the check.
 */
export async function getUniqueNewsSlug(title: string, currentSlug: string, currentId?: string | null): Promise<string> {
  const baseSlug = toSlug(currentSlug || title) || 'tin-tuc';
  if (!supabase) {
    return baseSlug; // Offline fallback
  }

  let slugCandidate = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    let query = supabase
      .from('news')
      .select('id')
      .eq('slug', slugCandidate);
    
    if (currentId) {
      query = query.neq('id', currentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking slug uniqueness:', error);
      break;
    }

    if (data && data.length > 0) {
      slugCandidate = `${baseSlug}-${counter}`;
      counter++;
    } else {
      exists = false;
    }
  }

  return slugCandidate;
}

/**
 * Checks if an event slug is already taken in the events array.
 * If currentId is provided, excludes that record from the check.
 */
export function getUniqueEventSlug(title: string, currentSlug: string, events: any[], currentId?: string | null): string {
  const baseSlug = toSlug(currentSlug || title) || 'su-kien';
  let slugCandidate = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    const duplicate = events.find(evt => evt.slug === slugCandidate && evt.id !== currentId);
    if (duplicate) {
      slugCandidate = `${baseSlug}-${counter}`;
      counter++;
    } else {
      exists = false;
    }
  }

  return slugCandidate;
}
