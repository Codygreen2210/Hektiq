import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const BAD_LINK = 'That reset link is expired or already used. Ask for a new one.'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()
    const t = String(token || '')
    const p = String(password || '')

    if (!/^[a-f0-9]{64}$/.test(t)) return NextResponse.json({ error: BAD_LINK })
    if (p.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' })
    if (p.length > 72) return NextResponse.json({ error: 'Keep the password under 72 characters.' })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data: row } = await supabase
      .from('password_resets')
      .select('user_id, expires_at')
      .eq('token', t)
      .maybeSingle()

    if (!row) return NextResponse.json({ error: BAD_LINK })

    // Use up the link right away, even if something fails after
    await supabase.from('password_resets').delete().eq('user_id', row.user_id)

    if (new Date(row.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: BAD_LINK })
    }

    const { error } = await supabase.auth.admin.updateUserById(row.user_id, { password: p })
    if (error) return NextResponse.json({ error: 'Couldn\'t change your password. Ask for a new link and try again.' })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong. Try again.' })
  }
}