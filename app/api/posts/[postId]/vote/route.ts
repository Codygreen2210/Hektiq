import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { direction, previousVote } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data: post } = await supabase
      .from('posts')
      .select('upvotes')
      .eq('id', postId)
      .single()

    if (!post) return NextResponse.json({ error: 'Post not found' })

    let change = 0
    if (!previousVote) {
      change = direction === 'up' ? 1 : -1
    } else if (previousVote === 'down' && direction === 'up') {
      change = 1
    } else if (previousVote === 'up' && direction === 'down') {
      change = -1
    }

    const newCount = (post.upvotes || 0) + change

    const { data, error } = await supabase
      .from('posts')
      .update({ upvotes: newCount })
      .eq('id', postId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message })
    return NextResponse.json({ upvotes: data.upvotes })

  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}