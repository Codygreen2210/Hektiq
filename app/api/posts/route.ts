import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest, attachAuthors } from '../../../lib/serverAuth'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
}

export async function POST(request: Request) {
  try {
    const { title, body, community_slug } = await request.json()
    const t = (title || '').trim()
    const b = (body || '').trim()

    if (!t || !b || !community_slug) return NextResponse.json({ error: 'Missing required fields' })
    if (t.length > 300) return NextResponse.json({ error: 'Keep the title under 300 characters.' })
    if (b.length > 20000) return NextResponse.json({ error: 'That post is too long.' })

    const supabase = db()
    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in to post.' })

    const { data, error } = await supabase
      .from('posts')
      .insert({ title: t, body: b, community_id: community_slug, author_id: user.id })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message })
    return NextResponse.json({ post: { ...data, author: user } })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const community_slug = searchParams.get('community')

    const supabase = db()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('community_id', community_slug)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message })

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
    return NextResponse.json({ posts: withAuthors })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}