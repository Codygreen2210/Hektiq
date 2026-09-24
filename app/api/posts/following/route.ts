import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest, attachAuthors } from '../../../../lib/serverAuth'

export const dynamic = 'force-dynamic'

const LIMIT = 50

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in to see posts from your communities.' })

    const { data: follows } = await supabase
      .from('community_follows')
      .select('community_slug')
      .eq('user_id', user.id)

    const slugs = (follows || []).map(f => f.community_slug)
    if (slugs.length === 0) return NextResponse.json({ posts: [], following: [] })

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .in('community_id', slugs)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(LIMIT)

    if (error) return NextResponse.json({ error: 'Couldn\'t load posts.' })

    const posts = data || []
    const ids = posts.map(p => p.id)
    const counts: Record<string, number> = {}

    if (ids.length > 0) {
      const { data: comments } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', ids)
        .eq('is_deleted', false)
      for (const c of comments || []) counts[c.post_id] = (counts[c.post_id] || 0) + 1
    }

    const withCounts = posts.map(p => ({ ...p, comment_count: counts[p.id] || 0 }))
    const withAuthors = await attachAuthors(withCounts, supabase)
    return NextResponse.json({ posts: withAuthors, following: slugs })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}