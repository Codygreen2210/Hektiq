import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/serverAuth'

const PUBLIC_FIELDS = 'id, username, bio, avatar_url, karma, created_at'

export async function POST(request: Request) {
  try {
    const { bio, avatar_url } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    // Only ever edit the logged-in person's own profile
    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in first.' })

    const updates: any = { updated_at: new Date().toISOString() }

    if (bio !== undefined) {
      const b = String(bio || '').trim()
      if (b.length > 300) return NextResponse.json({ error: 'Keep your bio under 300 characters.' })
      updates.bio = b
    }

    if (avatar_url !== undefined) {
      const prefix = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/avatars/'
      const a = String(avatar_url || '')
      if (!a.startsWith(prefix) || a.length > 500) return NextResponse.json({ error: 'That photo link isn\'t allowed.' })
      updates.avatar_url = a
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select(PUBLIC_FIELDS)
      .single()

    if (error) return NextResponse.json({ error: 'Couldn\'t save. Try again.' })
    return NextResponse.json({ profile: data })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}