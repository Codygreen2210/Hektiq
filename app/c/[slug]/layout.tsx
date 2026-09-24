import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { seededBySlug } from '../../../lib/communities'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://hektiq.com'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  let name = seededBySlug[slug]?.name
  let description = seededBySlug[slug]?.description

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

  const title = name + ' · Hektiq'
  const desc = description || name + ' on Hektiq. Your corner of the internet, run by the people in it.'
  const url = SITE + '/c/' + slug

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, siteName: 'Hektiq', type: 'website' },
    twitter: { card: 'summary', title, description: desc },
  }
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children
}