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

// List banned accounts
export async function GET(request: Request) {
  try {
    const supabase = db()
    const admin = await requireAdmin(request, supabase)
    if (!admin) return NextResponse.json({ error: 'Admins only.' }, { status: 403 })

    const { data } = await supabase
      .from('users')
      .select('username, banned_at, ban_reason')
      .eq('is_banned', true)
      .order('banned_at', { ascending: false })

    return NextResponse.json({ banned: data || [] }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}

// Ban or unban
export async function POST(request: Request) {
  try {
    const supabase = db()
    const admin = await requireAdmin(request, supabase)
    if (!admin) return NextResponse.json({ error: 'Admins only.' }, { status: 403 })

    const { username, action, reason, hideContent, removeFounder } = await request.json()
    const name = String(username || '').trim().toLowerCase().replace(/^@/, '')
    if (!name || !['ban', 'unban'].includes(action)) return NextResponse.json({ error: 'Bad request.' })

    const { data: target } = await supabase
      .from('users')
      .select('id, username, is_admin, is_banned')
      .eq('username', name)
      .maybeSingle()
    if (!target) return NextResponse.json({ error: 'No account named "' + name + '".' })
    if (target.id === admin.id) return NextResponse.json({ error: 'You can\'t ban yourself.' })
    if (target.is_admin) return NextResponse.json({ error: 'Admins can\'t be banned. Remove their admin first.' })

    if (action === 'unban') {
      await supabase.from('users').update({ is_banned: false, banned_at: null, ban_reason: null }).eq('id', target.id)
      return NextResponse.json({ ok: true, message: target.username + ' is unbanned.' })
    }

    const updates: any = {
      is_banned: true,
      banned_at: new Date().toISOString(),
      ban_reason: String(reason || '').trim().slice(0, 300) || null,
    }
    if (removeFounder === true) updates.founder_number = null
    await supabase.from('users').update(updates).eq('id', target.id)

    let hidden = ''
    if (hideContent === true) {
      const { count: p } = await supabase.from('posts').update({ is_deleted: true }, { count: 'exact' }).eq('author_id', target.id).eq('is_deleted', false)
      const { count: c } = await supabase.from('comments').update({ is_deleted: true }, { count: 'exact' }).eq('author_id', target.id).eq('is_deleted', false)
      hidden = ' Hid ' + (p || 0) + ' posts and ' + (c || 0) + ' comments.'
    }

    return NextResponse.json({ ok: true, message: target.username + ' is banned.' + hidden })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}