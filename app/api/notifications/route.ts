import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../lib/serverAuth'

export const dynamic = 'force-dynamic'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
}

// Your recent notifications and how many are unread
export async function GET(request: Request) {
  try {
    const supabase = db()
    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in first.' })

    const { data: rows } = await supabase
      .from('notifications')
      .select('id, actor_id, type, post_id, comment_id, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)

    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    const list = rows || []
    const actorIds = [...new Set(list.map(r => r.actor_id).filter(Boolean))]
    const postIds = [...new Set(list.map(r => r.post_id).filter(Boolean))]

    const actors: Record<string, any> = {}
    if (actorIds.length) {
      const { data } = await supabase.from('users').select('id, username, avatar_url, founder_number').in('id', actorIds)
      for (const u of data || []) actors[u.id] = u
    }

    const posts: Record<string, any> = {}
    if (postIds.length) {
      const { data } = await supabase.from('posts').select('id, title, community_id, is_deleted').in('id', postIds)
      for (const p of data || []) posts[p.id] = p
    }

    const notifications = list
      .filter(r => posts[r.post_id] && !posts[r.post_id].is_deleted)
      .map(r => {
        const p = posts[r.post_id]
        const a = r.actor_id ? actors[r.actor_id] : null
        return {
          id: r.id,
          type: r.type,
          read: r.read,
          created_at: r.created_at,
          actor: a ? { username: a.username, avatar_url: a.avatar_url, founder_number: a.founder_number } : null,
          post_title: p.title,
          link: '/c/' + p.community_id + '/post/' + p.id + (r.comment_id ? '#c-' + r.comment_id : ''),
        }
      })

    return NextResponse.json(
      { notifications, unread: count || 0 },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}

// Mark all as read
export async function POST(request: Request) {
  try {
    const supabase = db()
    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in first.' })

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}