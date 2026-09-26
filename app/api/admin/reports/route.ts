import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/serverAuth'

export const dynamic = 'force-dynamic'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
}

async function requireAdmin(request: Request, supabase: any) {
  const user = await getUserFromRequest(request, supabase)
  if (!user) return null
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).maybeSingle()
  return data?.is_admin ? user : null
}

const OPEN = (s: string | null) => s !== 'dismissed' && s !== 'actioned'

// Hidden posts, plus posts with open reports
export async function GET(request: Request) {
  try {
    const supabase = db()
    const admin = await requireAdmin(request, supabase)
    if (!admin) return NextResponse.json({ error: 'Admins only.' }, { status: 403 })

    const { data: reports } = await supabase
      .from('post_reports')
      .select('post_id, reason, details, reporter_username, status, created_at')
      .order('created_at', { ascending: false })
      .limit(500)

    const openReports = (reports || []).filter(r => OPEN(r.status))
    const byPost: Record<string, any[]> = {}
    for (const r of openReports) {
      if (!byPost[r.post_id]) byPost[r.post_id] = []
      byPost[r.post_id].push({ reason: r.reason, details: r.details, reporter: r.reporter_username, created_at: r.created_at })
    }

    const { data: hiddenRows } = await supabase
      .from('posts')
      .select('id')
      .eq('auto_hidden', true)

    const ids = [...new Set([...Object.keys(byPost), ...(hiddenRows || []).map(p => p.id)])]
    if (ids.length === 0) return NextResponse.json({ hidden: [], reported: [] })

    const { data: posts } = await supabase
      .from('posts')
      .select('id, title, body, community_id, author_id, image_urls, video_url, is_deleted, auto_hidden, hidden_at, created_at')
      .in('id', ids)

    const authorIds = [...new Set((posts || []).map(p => p.author_id).filter(Boolean))]
    const authors: Record<string, string> = {}
    if (authorIds.length) {
      const { data: users } = await supabase.from('users').select('id, username').in('id', authorIds)
      for (const u of users || []) authors[u.id] = u.username
    }

    const shaped = (posts || []).map(p => ({
      id: p.id,
      title: p.title,
      body: (p.body || '').slice(0, 400),
      community_id: p.community_id,
      author: p.author_id ? authors[p.author_id] || 'deleted account' : 'deleted account',
      image_urls: Array.isArray(p.image_urls) ? p.image_urls : [],
      video_url: p.video_url,
      auto_hidden: p.auto_hidden,
      is_deleted: p.is_deleted,
      hidden_at: p.hidden_at,
      created_at: p.created_at,
      reports: byPost[p.id] || [],
    }))

    const hidden = shaped.filter(p => p.auto_hidden).sort((a, b) => String(b.hidden_at).localeCompare(String(a.hidden_at)))
    const reported = shaped.filter(p => !p.auto_hidden && !p.is_deleted && p.reports.length > 0)
      .sort((a, b) => b.reports.length - a.reports.length)

    return NextResponse.json({ hidden, reported }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}

// Actions: restore, remove, hide, dismiss
export async function POST(request: Request) {
  try {
    const supabase = db()
    const admin = await requireAdmin(request, supabase)
    if (!admin) return NextResponse.json({ error: 'Admins only.' }, { status: 403 })

    const { id, action } = await request.json()
    if (!id || !['restore', 'remove', 'hide', 'dismiss'].includes(action)) {
      return NextResponse.json({ error: 'Bad request.' })
    }

    if (action === 'restore') {
      await supabase.from('posts').update({ is_deleted: false, auto_hidden: false, hidden_at: null }).eq('id', id)
      await supabase.from('post_reports').update({ status: 'dismissed' }).eq('post_id', id)
    } else if (action === 'remove') {
      await supabase.from('posts').update({ is_deleted: true, auto_hidden: false }).eq('id', id)
      await supabase.from('post_reports').update({ status: 'actioned' }).eq('post_id', id)
    } else if (action === 'hide') {
      await supabase.from('posts').update({ is_deleted: true, auto_hidden: true, hidden_at: new Date().toISOString() }).eq('id', id)
    } else if (action === 'dismiss') {
      await supabase.from('post_reports').update({ status: 'dismissed' }).eq('post_id', id)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}