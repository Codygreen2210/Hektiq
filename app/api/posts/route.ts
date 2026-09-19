import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const authCookie = allCookies.find(c => c.name.includes('auth-token') || c.name.includes('access_token'))

    let author_id = null

    if (authCookie) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authCookie.value)
        if (user) author_id = user.id
      } catch (e) {
        console.log('Could not get user from token')
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        body,
        community_id: community_slug,
        author_id
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