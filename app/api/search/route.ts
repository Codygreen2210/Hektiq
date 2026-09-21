import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.length < 2) {
      return NextResponse.json({ posts: [], communities: [] })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .or(`title.ilike.%${q}%,body.ilike.%${q}%`)
      .eq('is_deleted', false)
      .limit(10)

    const { data: communities } = await supabase
      .from('communities')
      .select('*')
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(5)

    return NextResponse.json({
      posts: posts || [],
      communities: communities || []
    })

  } catch (e) {
    return NextResponse.json({ posts: [], communities: [] })
  }
}