import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error) return NextResponse.json({ error: error.message })

    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', profile.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    return NextResponse.json({ profile, posts: posts || [] })

  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}