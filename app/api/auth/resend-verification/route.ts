import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/serverAuth'
import { sendVerificationEmail, baseUrlFrom } from '../../../../lib/verifyEmail'

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in first.' })

    const { data: me } = await supabase
      .from('users')
      .select('email, username, email_verified')
      .eq('id', user.id)
      .single()

    if (!me) return NextResponse.json({ error: 'Account not found.' })
    if (me.email_verified) return NextResponse.json({ ok: true, already: true })

    const { data: last } = await supabase
      .from('email_verifications')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (last && Date.now() - new Date(last.created_at).getTime() < 60 * 1000) {
      return NextResponse.json({ error: 'Just sent one. Give it a minute, and check your spam folder.' })
    }

    const result = await sendVerificationEmail(supabase, {
      userId: user.id,
      email: me.email,
      username: me.username,
      baseUrl: baseUrlFrom(request)
    })

    if (!result.ok) return NextResponse.json({ error: 'Couldn\'t send the email. Try again in a bit.' })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}