import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json()

    const cleanEmail = (email || '').trim().toLowerCase()
    const cleanName = (username || '').trim().toLowerCase()

    if (!cleanEmail || !password) return Response.json({ error: 'Email and password are required.' })
    if (password.length < 8) return Response.json({ error: 'Password must be at least 8 characters.' })
    if (!/^[a-z0-9_]{3,20}$/.test(cleanName)) {
      return Response.json({ error: 'Username must be 3 to 20 characters: letters, numbers, or underscores.' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data: nameTaken } = await supabase
      .from('users')
      .select('id')
      .eq('username', cleanName)
      .maybeSingle()
    if (nameTaken) return Response.json({ error: 'That username is taken. Try another.' })

    const { data: emailTaken } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle()
    if (emailTaken) return Response.json({ error: 'An account with that email already exists. Try logging in.' })

    const { data, error } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true
    })
    if (error) return Response.json({ error: error.message })

    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email: cleanEmail,
      username: cleanName,
      password_hash: 'managed_by_supabase_auth',
      karma: 0,
      is_admin: false
    })

    if (profileError) {
      await supabase.auth.admin.deleteUser(data.user.id)
      return Response.json({ error: 'Couldn\'t finish creating your account. Try again.' })
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY
      },
      body: JSON.stringify({
        from: 'Hektiq <noreply@hektiq.com>',
        to: cleanEmail,
        subject: 'Welcome to Hektiq',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #080F14; color: white; border-radius: 16px;">
            <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #A78BFA;">Hektiq</h1>
            <h2 style="font-size: 20px; color: white; margin-bottom: 16px;">Welcome, ${cleanName}.</h2>
            <p style="color: #94A3B8; margin-bottom: 32px; line-height: 1.6;">You're in. Come join the conversation.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/login" style="background: #8B5CF6; color: white; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block;">
              Go to Hektiq
            </a>
            <p style="color: #475569; font-size: 12px; margin-top: 32px;">If you didn't create this account you can ignore this email.</p>
          </div>
        `
      })
    }).catch(() => {})

    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: 'Something went wrong.' })
  }
}