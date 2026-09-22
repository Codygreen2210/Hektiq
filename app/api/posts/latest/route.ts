import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data, error } = await supabase
      .from('posts')
      .select('id, title, body, community_id, upvotes, created_at')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) return NextResponse.json({ posts: [] })
    return NextResponse.json({ posts: data || [] })
  } catch (e) {
    return NextResponse.json({ posts: [] })
  }
}