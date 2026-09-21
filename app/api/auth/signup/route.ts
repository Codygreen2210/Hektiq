export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const generatedUsername = username || email.split('@')[0]

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false
    })

    if (error) return Response.json({ error: error.message })

    await supabase.from('users').insert({
      id: data.user.id,
      email,
      username: generatedUsername,
      password_hash: 'managed_by_supabase_auth',
      karma: 0,
      is_admin: false
    })

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY
      },
      body: JSON.stringify({
        from: 'Hektiq <noreply@hektiq.com>',
        to: email,
        subject: 'Welcome to Hektiq — verify your email',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #080F14; color: white; border-radius: 16px;">
            <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; background: linear-gradient(to right, #8B5CF6, #06B6D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Hektiq</h1>
            <h2 style="font-size: 20px; color: white; margin-bottom: 16px;">Welcome, ${generatedUsername}.</h2>
            <p style="color: #94A3B8; margin-bottom: 32px; line-height: 1.6;">You're one step away from joining the community. Click below to verify your email and activate your account.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/login" style="background: linear-gradient(to right, #8B5CF6, #06B6D4); color: white; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block;">
              Go to Hektiq
            </a>
            <p style="color: #475569; font-size: 12px; margin-top: 32px;">If you didn't create this account you can ignore this email.</p>
          </div>
        `
      })
    })

    return Response.json({ user: data.user, message: 'Check your email to verify your account.' })
  } catch (e) {
    return Response.json({ error: 'Something went wrong' })
  }
}