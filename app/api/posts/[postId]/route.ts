import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { attachAuthors, getUserFromRequest, VERIFY_MESSAGE } from '../../../../lib/serverAuth'

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

// Edit your own post: title and text only
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { title, body } = await request.json()
    const t = String(title || '').trim()
    const b = String(body || '').trim()

    if (!t) return NextResponse.json({ error: 'Add a title.' })
    if (t.length > 300) return NextResponse.json({ error: 'Keep the title under 300 characters.' })
    if (b.length > 20000) return NextResponse.json({ error: 'That post is too long.' })

    const supabase = db()
    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in first.' })
    if (!user.email_verified) return NextResponse.json({ error: VERIFY_MESSAGE })

    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id, video_url, image_urls')
      .eq('id', postId)
      .eq('is_deleted', false)
      .maybeSingle()

    if (!post) return NextResponse.json({ error: 'Post not found.' })
    if (post.author_id !== user.id) return NextResponse.json({ error: 'You can only edit your own posts.' })

    const hasMedia = !!post.video_url || (Array.isArray(post.image_urls) && post.image_urls.length > 0)
    if (!b && !hasMedia) return NextResponse.json({ error: 'Add something in the body.' })

    const { data, error } = await supabase
      .from('posts')
      .update({ title: t, body: b, edited_at: new Date().toISOString() })
      .eq('id', postId)
      .select('title, body, edited_at')
      .single()

    if (error) return NextResponse.json({ error: 'Couldn\'t save that. Try again.' })
    return NextResponse.json({ post: data })
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