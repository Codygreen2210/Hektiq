import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest, attachAuthors } from '../../../lib/serverAuth'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
}

export async function POST(request: Request) {
  try {
    const { body, post_id } = await request.json()
    const text = (body || '').trim()

    if (!text || !post_id) return NextResponse.json({ error: 'Missing required fields' })
    if (text.length > 5000) return NextResponse.json({ error: 'Keep it under 5,000 characters.' })

    const supabase = db()
    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in to comment.' })

    const { data, error } = await supabase
      .from('comments')
      .insert({ body: text, post_id, author_id: user.id })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message })
    return NextResponse.json({ comment: { ...data, author: user } })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const post_id = searchParams.get('post_id')

    const supabase = db()
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post_id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message })
    const withAuthors = await attachAuthors(data || [], supabase)
    return NextResponse.json({ comments: withAuthors })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}