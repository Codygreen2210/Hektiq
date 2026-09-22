import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const TYPES = ['idea', 'complaint', 'bug']

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function POST(request: Request) {
  try {
    const { type, message, email, username, website } = await request.json()

    if (website) return NextResponse.json({ ok: true })

    if (!TYPES.includes(type)) return NextResponse.json({ error: 'Pick a type.' })
    const text = (message || '').trim()
    if (text.length < 10) return NextResponse.json({ error: 'Tell us a little more (at least 10 characters).' })
    if (text.length > 2000) return NextResponse.json({ error: 'Keep it under 2,000 characters.' })
    const replyEmail = (email || '').trim()
    if (replyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyEmail)) {
      return NextResponse.json({ error: 'That email doesn\'t look right.' })
    }

    const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', oneHourAgo)

    if ((count || 0) >= 3) {
      return NextResponse.json({ error: 'You\'ve sent a few already. Try again in an hour.' })
    }

    const { error } = await supabase.from('suggestions').insert({
      type,
      message: text,
      email: replyEmail || null,
      username: username || null,
      ip
    })

    if (error) return NextResponse.json({ error: 'Couldn\'t save that. Try again.' })

    const label = type === 'idea' ? 'Idea' : type === 'complaint' ? 'Complaint' : 'Bug'

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY
      },
      body: JSON.stringify({
        from: 'Hektiq Suggestions <noreply@hektiq.com>',
        to: 'cody@hektiq.com',
        reply_to: replyEmail || undefined,
        subject: 'New ' + label.toLowerCase() + ' on Hektiq',
        html: `
          <div style="font-family: sans-serif; max-width: 520px;">
            <p style="font-size: 13px; color: #666; margin: 0 0 8px;">${label}${username ? ' from ' + escapeHtml(username) : ''}</p>
            <p style="font-size: 15px; line-height: 1.6; white-space: pre-wrap; margin: 0 0 16px;">${escapeHtml(text)}</p>
            <p style="font-size: 13px; color: #666; margin: 0;">${replyEmail ? 'Reply to: ' + escapeHtml(replyEmail) : 'No reply email given.'}</p>
          </div>
        `
      })
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}