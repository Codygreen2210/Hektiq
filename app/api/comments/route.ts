import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { body, post_id } = await request.json()

    if (!body || !post_id) {
      return NextResponse.json({ error: 'Missing required fields' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data, error } = await supabase
      .from('comments')
      .insert({
        body,
        post_id,
        author_id: null
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message })
    return NextResponse.json({ comment: data })

  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const post_id = searchParams.get('post_id')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post_id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message })
    return NextResponse.json({ comments: data })

  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}