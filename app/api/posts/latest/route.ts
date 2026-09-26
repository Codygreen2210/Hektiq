import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Homepage "Latest": real people's posts only
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data: bots } = await supabase.from('users').select('id').eq('is_bot', true)
    const botIds = new Set((bots || []).map(b => b.id))

    const { data, error } = await supabase
      .from('posts')
      .select('id, title, body, community_id, upvotes, created_at, author_id')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(60)

    if (error) return NextResponse.json({ posts: [] })

    const posts = (data || [])
      .filter(p => !p.author_id || !botIds.has(p.author_id))
      .slice(0, 6)
      .map(({ author_id, ...p }) => p)

    return NextResponse.json({ posts })
  } catch (e) {
    return NextResponse.json({ posts: [] })
  }
}