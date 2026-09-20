import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { user_id, bio, avatar_url } = await request.json()

    if (!user_id) return NextResponse.json({ error: 'Not authenticated' })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const updates: any = { updated_at: new Date().toISOString() }
    if (bio !== undefined) updates.bio = bio
    if (avatar_url !== undefined) updates.avatar_url = avatar_url

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user_id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message })
    return NextResponse.json({ profile: data })

  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}