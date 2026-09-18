import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { title, body, community_slug } = await request.json()

    if (!title || !body || !community_slug) {
      return NextResponse.json({ error: 'Missing required fields' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        body,
        community_id: community_slug,
        author_id: '00000000-0000-0000-0000-000000000000'
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message })
    return NextResponse.json({ post: data })

  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const community_slug = searchParams.get('community')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('community_id', community_slug)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message })
    return NextResponse.json({ posts: data })

  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}