import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../../lib/serverAuth'

const MAX_PINS = 2

// Admin only: pin or unpin a post (toggle)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in first.' })
    const { data: me } = await supabase.from('users').select('is_admin').eq('id', user.id).maybeSingle()
    if (!me?.is_admin) return NextResponse.json({ error: 'Only admins can pin posts.' })

    const { data: post } = await supabase
      .from('posts')
      .select('id, community_id, is_pinned, is_deleted')
      .eq('id', postId)
      .maybeSingle()
    if (!post || post.is_deleted) return NextResponse.json({ error: 'That post is gone.' })

    if (post.is_pinned) {
      await supabase.from('posts').update({ is_pinned: false, pinned_at: null }).eq('id', postId)
      return NextResponse.json({ pinned: false })
    }

    const { count } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', post.community_id)
      .eq('is_pinned', true)
      .eq('is_deleted', false)
    if ((count || 0) >= MAX_PINS) {
      return NextResponse.json({ error: 'This community already has ' + MAX_PINS + ' pinned posts. Unpin one first.' })
    }

    await supabase.from('posts').update({ is_pinned: true, pinned_at: new Date().toISOString() }).eq('id', postId)
    return NextResponse.json({ pinned: true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}