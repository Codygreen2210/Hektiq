import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest, VERIFY_MESSAGE } from '../../../../../lib/serverAuth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params
    const { direction } = await request.json()
    if (direction !== 'up' && direction !== 'down') return NextResponse.json({ error: 'Bad vote.' })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in to vote.' })
    if (!user.email_verified) return NextResponse.json({ error: VERIFY_MESSAGE })

    const { data: comment } = await supabase
      .from('comments')
      .select('id, is_deleted')
      .eq('id', commentId)
      .maybeSingle()
    if (!comment || comment.is_deleted) return NextResponse.json({ error: 'That comment is gone.' })

    const value = direction === 'up' ? 1 : -1

    const { data: existing } = await supabase
      .from('comment_votes')
      .select('value')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .maybeSingle()

    let myVote: 'up' | 'down' | null = direction
    if (existing && existing.value === value) {
      await supabase.from('comment_votes').delete().eq('comment_id', commentId).eq('user_id', user.id)
      myVote = null
    } else {
      const { error } = await supabase
        .from('comment_votes')
        .upsert({ comment_id: commentId, user_id: user.id, value }, { onConflict: 'comment_id,user_id' })
      if (error) return NextResponse.json({ error: 'Couldn\'t save your vote.' })
    }

    const { data: all } = await supabase.from('comment_votes').select('value').eq('comment_id', commentId)
    const score = (all || []).reduce((s, v) => s + v.value, 0)
    await supabase.from('comments').update({ score }).eq('id', commentId)

    return NextResponse.json({ score, myVote })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}