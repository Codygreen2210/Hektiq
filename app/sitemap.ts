import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { seededCommunities } from '../lib/communities'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://hektiq.com'

// Rebuild the sitemap at most once an hour
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const pages: MetadataRoute.Sitemap = [
    { url: SITE + '/', lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: SITE + '/trending', lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: SITE + '/communities', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: SITE + '/privacy', lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  for (const c of seededCommunities) {
    pages.push({ url: SITE + '/c/' + c.slug, lastModified: now, changeFrequency: 'daily', priority: 0.9 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    )

    const seeded = new Set(seededCommunities.map(c => c.slug))

    const { data: communities } = await supabase
      .from('communities')
      .select('slug, created_at')
      .limit(1000)

    for (const c of communities || []) {
      if (!c.slug || seeded.has(c.slug)) continue
      pages.push({ url: SITE + '/c/' + c.slug, lastModified: new Date(c.created_at), changeFrequency: 'daily', priority: 0.6 })
    }

    const { data: posts } = await supabase
      .from('posts')
      .select('id, community_id, created_at')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(5000)

    for (const p of posts || []) {
      pages.push({
        url: SITE + '/c/' + p.community_id + '/post/' + p.id,
        lastModified: new Date(p.created_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch (e) {
    // If the database is down, still return the main pages
  }

  return pages
}