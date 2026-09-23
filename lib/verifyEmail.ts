import { SupabaseClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export async function sendVerificationEmail(
  supabase: SupabaseClient,
  opts: { userId: string; email: string; username: string; baseUrl: string }
) {
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await supabase.from('email_verifications').delete().eq('user_id', opts.userId)

  const { error } = await supabase.from('email_verifications').insert({
    token,
    user_id: opts.userId,
    expires_at: expires
  })
  if (error) return { ok: false }

  const link = opts.baseUrl + '/auth/verify?token=' + token

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.RESEND_API_KEY
    },
    body: JSON.stringify({
      from: 'Hektiq <noreply@hektiq.com>',
      to: opts.email,
      subject: 'Verify your email for Hektiq',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #FBF1DC; color: #2A1F16; border: 2px solid #2A1F16; border-radius: 10px; overflow: hidden;">
          <div style="height: 4px; background: #E4502F;"></div>
          <div style="height: 4px; background: #F08A24;"></div>
          <div style="height: 4px; background: #F2C230;"></div>
          <div style="height: 4px; background: #2FA36B;"></div>
          <div style="height: 4px; background: #2B84D6;"></div>
          <div style="padding: 32px 24px;">
            <p style="font-size: 28px; font-weight: 800; letter-spacing: 2px; margin: 0 0 16px;">HEKTIQ</p>
            <p style="font-size: 18px; font-weight: 700; margin: 0 0 12px;">Hey ${opts.username}, one last step.</p>
            <p style="font-size: 15px; line-height: 1.6; color: #6B5A48; margin: 0 0 24px;">Tap the button to verify your email. Once you do, you can post, comment, and vote.</p>
            <a href="${link}" style="display: inline-block; background: #E4502F; color: #FFF7EA; border: 2px solid #2A1F16; padding: 13px 26px; border-radius: 6px; text-decoration: none; font-weight: 700;">Verify my email</a>
            <p style="font-size: 12px; color: #9A8870; margin: 28px 0 0; line-height: 1.5;">This link works for 24 hours. If you didn't sign up for Hektiq, you can ignore this email.</p>
          </div>
        </div>
      `
    })
  }).catch(() => null)

  return { ok: !!res && res.ok }
}

export function baseUrlFrom(request: Request) {
  const origin = request.headers.get('origin')
  if (origin) return origin
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://hektiq.com'
}