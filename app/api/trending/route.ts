import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const DAYS = 14
const LIMIT = 50

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type') === 'videos' ? 'videos' : 'posts'
    const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString()

    let query = supabase
      .from('posts')
      .select('id, title, body, community_id, author_id, upvotes, video_url, image_urls, created_at')
      .eq('is_deleted', false)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(500)

    query = type === 'videos' ? query.not('video_url', 'is', null) : query.is('video_url', null)

    const { data: posts, error } = await query
    if (error) throw error
    if (!posts || posts.length === 0) return NextResponse.json({ posts: [] })

    const postIds = posts.map((p) => p.id)

    // Comment counts
    const { data: comments } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds)
      .eq('is_deleted', false)

    const commentCounts: Record<string, number> = {}
    for (const c of comments || []) {
      commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1
    }

    // Score and sort
    const now = Date.now()
    const scored = posts
      .map((p) => {
        const hours = (now - new Date(p.created_at).getTime()) / 3600000
        const count = commentCounts[p.id] || 0
        const score = ((p.upvotes || 0) + count * 2 + 1) / Math.pow(hours + 2, 1.5)
        return { ...p, comment_count: count, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, LIMIT)

    // Authors
    const authorIds = [...new Set(scored.map((p) => p.author_id).filter(Boolean))]
    const authors: Record<string, { username: string; avatar_url: string | null }> = {}
    if (authorIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .in('id', authorIds)
      for (const u of users || []) {
        authors[u.id] = { username: u.username, avatar_url: u.avatar_url }
      }
    }

    const result = scored.map((p) => ({
      ...p,
      author_username: authors[p.author_id]?.username || 'unknown',
      author_avatar_url: authors[p.author_id]?.avatar_url || null,
    }))

    return NextResponse.json({ posts: result })
  } catch (err) {
    console.error('Trending error:', err)
    return NextResponse.json({ error: 'Could not load trending' }, { status: 500 })
  }
}