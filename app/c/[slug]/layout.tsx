import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { seededBySlug, LOCAL_INDEX_MIN_POSTS } from '../../../lib/communities'
import { realPostCount } from '../../../lib/realPosts'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://hektiq.com'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  const seeded = seededBySlug[slug]
  let name = seeded?.name
  let description = seeded?.description

  if (!name) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        { auth: { persistSession: false } }
      )
      const { data } = await supabase.from('communities').select('name, description').eq('slug', slug).maybeSingle()
      if (data) {
        name = data.name
        description = data.description
      }
    } catch (e) {}
  }

  if (!name) return { title: 'Community not found · Hektiq', robots: { index: false } }

  // Main communities use titles written to match what people search, like "Outdoors Forum: Hunting, Fishing & Camping"
  const title = (seeded?.seoTitle || name) + ' · Hektiq'
  const desc = seeded?.seoDescription || description || name + ' on Hektiq. Your corner of the internet, run by the people in it.'
  const url = SITE + '/c/' + slug

  // A brand-new local corner stays out of Google until real people have posted in it, so it never shows up empty
  let keepOutOfSearch = false
  if (seeded?.local) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        { auth: { persistSession: false } }
      )
      keepOutOfSearch = (await realPostCount(supabase, slug)) < LOCAL_INDEX_MIN_POSTS
    } catch (e) {
      keepOutOfSearch = true
    }
  }

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, siteName: 'Hektiq', type: 'website' },
    twitter: { card: 'summary', title, description: desc },
    ...(keepOutOfSearch ? { robots: { index: false, follow: true } } : {}),
  }
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children
}