import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest, VERIFY_MESSAGE } from '../../../../lib/serverAuth'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
}

// Edit your own comment
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params
    const { body } = await request.json()
    const text = String(body || '').trim()

    if (!text) return NextResponse.json({ error: 'A comment can\'t be empty. Delete it instead.' })
    if (text.length > 5000) return NextResponse.json({ error: 'Keep it under 5,000 characters.' })

    const supabase = db()
    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in first.' })
    if (!user.email_verified) return NextResponse.json({ error: VERIFY_MESSAGE })

    const { data: comment } = await supabase
      .from('comments')
      .select('id, author_id')
      .eq('id', commentId)
      .eq('is_deleted', false)
      .maybeSingle()

    if (!comment) return NextResponse.json({ error: 'Comment not found.' })
    if (comment.author_id !== user.id) return NextResponse.json({ error: 'You can only edit your own comments.' })

    const { data, error } = await supabase
      .from('comments')
      .update({ body: text, edited_at: new Date().toISOString() })
      .eq('id', commentId)
      .select('body, edited_at')
      .single()

    if (error) return NextResponse.json({ error: 'Couldn\'t save that. Try again.' })
    return NextResponse.json({ comment: data })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params
    const supabase = db()

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