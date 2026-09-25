import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    if (!token || typeof token !== 'string' || token.length !== 64) {
      return NextResponse.json({ error: 'That link isn\'t valid.' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data: row } = await supabase
      .from('email_verifications')
      .select('user_id, expires_at')
      .eq('token', token)
      .maybeSingle()

    if (!row) return NextResponse.json({ error: 'That link has already been used or isn\'t valid.' })

    if (new Date(row.expires_at).getTime() < Date.now()) {
      await supabase.from('email_verifications').delete().eq('token', token)
      return NextResponse.json({ error: 'That link expired. Log in and send a new one.' })
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('id', row.user_id)
      .select('id, email, username')
      .single()

    if (error || !user) return NextResponse.json({ error: 'Couldn\'t verify right now. Try again.' })

    await supabase.from('email_verifications').delete().eq('user_id', row.user_id)

    // Founding member number (1 to 1000). Null if all spots are taken.
    let founderNumber: number | null = null
    try {
      const { data: n } = await supabase.rpc('claim_founder_number', { uid: user.id })
      if (typeof n === 'number') founderNumber = n
    } catch (e) {}

    let tokenHash: string | null = null
    try {
      const { data: link } = await supabase.auth.admin.generateLink({ type: 'magiclink', email: user.email })
      tokenHash = link?.properties?.hashed_token || null
    } catch (e) {}

    return NextResponse.json({ ok: true, username: user.username, userId: user.id, tokenHash, founderNumber })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}