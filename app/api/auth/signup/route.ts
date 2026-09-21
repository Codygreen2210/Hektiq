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

    return Response.json({ user: data.user, message: 'Please check your email to verify your account.' })
  } catch (e) {
    return Response.json({ error: 'Something went wrong' })
  }
}