import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest, attachAuthors, VERIFY_MESSAGE } from '../../../lib/serverAuth'
import { parseVideo, isShortTiktokLink, VIDEO_SITES } from '../../../lib/video'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
}

export async function POST(request: Request) {
  try {
    const { title, body, community_slug, video_url } = await request.json()
    const t = (title || '').trim()
    const b = (body || '').trim()
    const rawVideo = (video_url || '').trim()

    if (!t || !community_slug) return NextResponse.json({ error: 'Add a title.' })
    if (t.length > 300) return NextResponse.json({ error: 'Keep the title under 300 characters.' })
    if (b.length > 20000) return NextResponse.json({ error: 'That post is too long.' })

    let videoCanonical: string | null = null
    if (rawVideo) {
      if (isShortTiktokLink(rawVideo)) {
        return NextResponse.json({ error: 'That\'s a TikTok short link. Open it, then copy the full link from your browser.' })
      }
      const v = parseVideo(rawVideo)
      if (!v) return NextResponse.json({ error: 'That video link isn\'t supported. Use a link from ' + VIDEO_SITES + '.' })
      videoCanonical = v.canonical
    }

    if (!b && !videoCanonical) return NextResponse.json({ error: 'Add something in the body, or a video link.' })

    const supabase = db()
    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in to post.' })
    if (!user.email_verified) return NextResponse.json({ error: VERIFY_MESSAGE })

    const { data, error } = await supabase
      .from('posts')
      .insert({ title: t, body: b, community_id: community_slug, author_id: user.id, video_url: videoCanonical })
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