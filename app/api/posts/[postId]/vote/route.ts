import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../../lib/serverAuth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { direction } = await request.json()

    if (direction !== 'up' && direction !== 'down') {
      return NextResponse.json({ error: 'Bad vote.' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in to vote.' })

    const value = direction === 'up' ? 1 : -1

    const { data: existing } = await supabase
      .from('post_votes')
      .select('value')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle()

    let myVote: 'up' | 'down' | null = direction

    if (existing && existing.value === value) {
      await supabase.from('post_votes').delete().eq('post_id', postId).eq('user_id', user.id)
      myVote = null
    } else {
      const { error } = await supabase
        .from('post_votes')
        .upsert({ post_id: postId, user_id: user.id, value }, { onConflict: 'post_id,user_id' })
      if (error) return NextResponse.json({ error: 'Couldn\'t save your vote.' })
    }

    const { data: all } = await supabase
      .from('post_votes')
      .select('value')
      .eq('post_id', postId)

    const score = (all || []).reduce((sum, v) => sum + v.value, 0)

    await supabase.from('posts').update({ upvotes: score }).eq('id', postId)

    return NextResponse.json({ upvotes: score, myVote })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}