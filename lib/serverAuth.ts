import { SupabaseClient } from '@supabase/supabase-js'

export async function getUserFromRequest(request: Request, supabase: SupabaseClient) {
  try {
    const header = request.headers.get('authorization') || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) return null

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return null

    const { data: profile } = await supabase
      .from('users')
      .select('id, username, avatar_url')
      .eq('id', user.id)
      .single()

    return profile || null
  } catch (e) {
    return null
  }
}

export async function attachAuthors(rows: any[], supabase: SupabaseClient) {
  const ids = Array.from(new Set(rows.map(r => r.author_id).filter(Boolean)))
  if (ids.length === 0) return rows.map(r => ({ ...r, author: null }))

  const { data: users } = await supabase
    .from('users')
    .select('id, username, avatar_url')
    .in('id', ids)

  const byId = Object.fromEntries((users || []).map(u => [u.id, u]))
  return rows.map(r => ({ ...r, author: byId[r.author_id] || null }))
}