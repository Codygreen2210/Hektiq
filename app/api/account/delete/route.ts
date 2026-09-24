import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/serverAuth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    if (!password) return NextResponse.json({ error: 'Enter your password.' })

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const user = await getUserFromRequest(request, admin)
    if (!user) return NextResponse.json({ error: 'Log in first.' })

    const { data: row } = await admin
      .from('users')
      .select('email, avatar_url')
      .eq('id', user.id)
      .maybeSingle()
    if (!row?.email) return NextResponse.json({ error: 'Couldn\'t find your account.' })

    // Check the password with a throwaway login
    const check = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      { auth: { persistSession: false } }
    )
    const { error: pwError } = await check.auth.signInWithPassword({ email: row.email, password: String(password) })
    if (pwError) return NextResponse.json({ error: 'That password isn\'t right.' })
    await check.auth.signOut().catch(() => {})

    // Keep posts and comments, just unlink them
    const { error: postErr } = await admin.from('posts').update({ author_id: null }).eq('author_id', user.id)
    if (postErr) return NextResponse.json({ error: 'Couldn\'t delete your account. Nothing was changed. Try again.' })
    await admin.from('comments').update({ author_id: null }).eq('author_id', user.id)

    // Avatar photo
    if (row.avatar_url && row.avatar_url.includes('/avatars/')) {
      const path = decodeURIComponent(row.avatar_url.split('/avatars/')[1].split('?')[0])
      if (path) await admin.storage.from('avatars').remove([path]).catch(() => null)
    }

    // Everything else tied to them
    await admin.from('update_subscribers').delete().eq('user_id', user.id)
    await admin.from('update_subscribers').delete().ilike('email', row.email)
    await admin.from('email_verifications').delete().eq('user_id', user.id)

    // Profile row (joined communities and reset links go with it)
    const { error: delErr } = await admin.from('users').delete().eq('id', user.id)
    if (delErr) return NextResponse.json({ error: 'Couldn\'t delete your account. Try again or email cody@hektiq.com.' })

    // Login
    await admin.auth.admin.deleteUser(user.id).catch(() => null)

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong. Try again.' })
  }
}