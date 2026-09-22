import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { attachAuthors } from '../../../../lib/serverAuth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('is_deleted', false)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Post not found' })

    const [withAuthor] = await attachAuthors([data], supabase)
    return NextResponse.json({ post: withAuthor })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}