export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (error) return Response.json({ error: error.message })
    return Response.json({ user: data.user })
  } catch (e) {
    return Response.json({ error: 'Something went wrong' })
  }
}
