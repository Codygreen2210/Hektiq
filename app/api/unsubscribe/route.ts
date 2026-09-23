import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
}

export async function POST(request: Request) {
  try {
    const { token, resubscribe } = await request.json()
    if (!token || typeof token !== 'string' || token.length !== 48) {
      return NextResponse.json({ error: 'That link isn\'t valid.' })
    }

    const supabase = db()
    const { data, error } = await supabase
      .from('update_subscribers')
      .update({ subscribed: resubscribe === true, updated_at: new Date().toISOString() })
      .eq('unsubscribe_token', token)
      .select('email')
      .maybeSingle()

    if (error || !data) return NextResponse.json({ error: 'That link isn\'t valid.' })
    return NextResponse.json({ ok: true, subscribed: resubscribe === true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}