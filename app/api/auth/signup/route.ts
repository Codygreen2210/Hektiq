import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { sendVerificationEmail, baseUrlFrom } from '../../../../lib/verifyEmail'
import { isDisposableEmail, isReservedUsername } from '../../../../lib/blockedSignups'

export async function POST(request: Request) {
  try {
    const { email, password, username, wantsUpdates } = await request.json()

    const cleanEmail = (email || '').trim().toLowerCase()
    const cleanName = (username || '').trim().toLowerCase()

    if (!cleanEmail || !password) return Response.json({ error: 'Email and password are required.' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail) || cleanEmail.length > 254) {
      return Response.json({ error: 'That email doesn\'t look right.' })
    }
    if (isDisposableEmail(cleanEmail)) {
      return Response.json({ error: 'Throwaway email addresses can\'t be used here. Hektiq is for real people, so use an email you actually check.' })
    }
    if (password.length < 8) return Response.json({ error: 'Password must be at least 8 characters.' })
    if (!/^[a-z0-9_]{3,20}$/.test(cleanName)) {
      return Response.json({ error: 'Username must be 3 to 20 characters: letters, numbers, or underscores.' })
    }
    if (isReservedUsername(cleanName)) {
      return Response.json({ error: 'That username is reserved. Try another.' })
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
      is_admin: false,
      email_verified: false
    })

    if (profileError) {
      await supabase.auth.admin.deleteUser(data.user.id)
      return Response.json({ error: 'Couldn\'t finish creating your account. Try again.' })
    }

    if (wantsUpdates === true) {
      await supabase.from('update_subscribers').upsert({
        email: cleanEmail,
        user_id: data.user.id,
        subscribed: true,
        unsubscribe_token: randomBytes(24).toString('hex'),
        source: 'signup',
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' })
    }

    await sendVerificationEmail(supabase, {
      userId: data.user.id,
      email: cleanEmail,
      username: cleanName,
      baseUrl: baseUrlFrom(request)
    })

    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: 'Something went wrong.' })
  }
}