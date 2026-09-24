import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

const PER_IP_PER_HOUR = 5
const DONE = { ok: true } // same answer whether the account exists or not

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const clean = String(email || '').trim().toLowerCase()
    if (!clean || !clean.includes('@') || clean.length > 254) {
      return NextResponse.json({ error: 'Enter a valid email.' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    // Rate limit by IP
    const { count } = await supabase
      .from('password_resets')
      .select('token', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', hourAgo)
    if ((count || 0) >= PER_IP_PER_HOUR) {
      return NextResponse.json({ error: 'Too many tries. Wait an hour and try again.' })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, username, email')
      .ilike('email', clean)
      .maybeSingle()

    if (!user) return NextResponse.json(DONE)

    // One live link per person
    await supabase.from('password_resets').delete().eq('user_id', user.id)

    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    const { error } = await supabase.from('password_resets').insert({ token, user_id: user.id, expires_at: expires, ip })
    if (error) return NextResponse.json({ error: 'Something went wrong. Try again.' })

    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://hektiq.com'
    const link = base + '/auth/reset?token=' + token

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY
      },
      body: JSON.stringify({
        from: 'Hektiq <noreply@hektiq.com>',
        to: user.email,
        subject: 'Reset your Hektiq password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #FBF1DC; color: #2A1F16; border: 2px solid #2A1F16; border-radius: 10px; overflow: hidden;">
            <div style="height: 4px; background: #E4502F;"></div>
            <div style="height: 4px; background: #F08A24;"></div>
            <div style="height: 4px; background: #F2C230;"></div>
            <div style="height: 4px; background: #2FA36B;"></div>
            <div style="height: 4px; background: #2B84D6;"></div>
            <div style="padding: 32px 24px;">
              <p style="font-size: 28px; font-weight: 800; letter-spacing: 2px; margin: 0 0 16px;">HEKTIQ</p>
              <p style="font-size: 18px; font-weight: 700; margin: 0 0 12px;">Hey ${user.username}, need a new password?</p>
              <p style="font-size: 15px; line-height: 1.6; color: #6B5A48; margin: 0 0 24px;">Tap the button to pick a new one.</p>
              <a href="${link}" style="display: inline-block; background: #E4502F; color: #FFF7EA; border: 2px solid #2A1F16; padding: 13px 26px; border-radius: 6px; text-decoration: none; font-weight: 700;">Reset my password</a>
              <p style="font-size: 12px; color: #9A8870; margin: 28px 0 0; line-height: 1.5;">This link works for 1 hour and only once. If you didn't ask for this, ignore this email. Your password won't change.</p>
            </div>
          </div>
        `
      })
    }).catch(() => null)

    return NextResponse.json(DONE)
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong. Try again.' })
  }
}