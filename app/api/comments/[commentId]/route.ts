import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/serverAuth'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in first.' })

    const { data: comment } = await supabase
      .from('comments')
      .select('id, author_id')
      .eq('id', commentId)
      .eq('is_deleted', false)
      .single()

    if (!comment) return NextResponse.json({ error: 'Comment not found.' })

    const { data: me } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (comment.author_id !== user.id && !me?.is_admin) {
      return NextResponse.json({ error: 'You can only delete your own comments.' })
    }

    const { error } = await supabase
      .from('comments')
      .update({ is_deleted: true })
      .eq('id', commentId)

    if (error) return NextResponse.json({ error: 'Couldn\'t delete that. Try again.' })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}