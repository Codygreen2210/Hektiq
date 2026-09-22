import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { attachAuthors, getUserFromRequest } from '../../../../lib/serverAuth'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = db()

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = db()

    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in first.' })

    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', postId)
      .eq('is_deleted', false)
      .single()

    if (!post) return NextResponse.json({ error: 'Post not found.' })

    const { data: me } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isOwner = post.author_id === user.id
    const isAdmin = !!me?.is_admin

    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'You can only delete your own posts.' })

    const { error } = await supabase
      .from('posts')
      .update({ is_deleted: true })
      .eq('id', postId)

    if (error) return NextResponse.json({ error: 'Couldn\'t delete that. Try again.' })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}