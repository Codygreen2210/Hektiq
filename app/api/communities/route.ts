import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, description, slug, letter, accent } = await request.json()

    if (!name || !description || !slug) {
      return NextResponse.json({ error: 'Missing required fields' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data, error } = await supabase
      .from('communities')
      .insert({
        name,
        description,
        slug,
        icon_emoji: letter,
        is_seeded: false
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message })
    return NextResponse.json({ community: data })

  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message })
    return NextResponse.json({ communities: data })

  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}