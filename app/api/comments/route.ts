import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest, attachAuthors, VERIFY_MESSAGE } from '../../../lib/serverAuth'
import { notify } from '../../../lib/notify'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
}

export async function POST(request: Request) {
  try {
    const { body, post_id, parent_id } = await request.json()
    const text = (body || '').trim()

    if (!text || !post_id) return NextResponse.json({ error: 'Missing required fields' })
    if (text.length > 5000) return NextResponse.json({ error: 'Keep it under 5,000 characters.' })

    const supabase = db()
    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in to comment.' })
    if (!user.email_verified) return NextResponse.json({ error: VERIFY_MESSAGE })

    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id, is_deleted')
      .eq('id', post_id)
      .maybeSingle()
    if (!post || post.is_deleted) return NextResponse.json({ error: 'That post is gone.' })

    // Replying to a comment: it has to be on this post and still up
    let parent: { id: string; author_id: string | null } | null = null
    if (parent_id) {
      const { data: p } = await supabase
        .from('comments')
        .select('id, post_id, author_id, is_deleted')
        .eq('id', parent_id)
        .maybeSingle()
      if (!p || p.post_id !== post_id || p.is_deleted) {
        return NextResponse.json({ error: 'That comment is gone, so you can\'t reply to it.' })
      }
      parent = { id: p.id, author_id: p.author_id }
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({ body: text, post_id, author_id: user.id, parent_id: parent ? parent.id : null })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Couldn\'t post that. Try again.' })

    // Notices
    if (parent) {
      await notify(supabase, { to: parent.author_id, from: user.id, type: 'reply', postId: post_id, commentId: data.id })
    } else {
      await notify(supabase, { to: post.author_id, from: user.id, type: 'comment', postId: post_id, commentId: data.id })
    }

    return NextResponse.json({ comment: { ...data, author: user } })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const post_id = searchParams.get('post_id')

    const supabase = db()
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post_id)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: 'Couldn\'t load comments.' })

    const all = data || []

    // Keep a deleted comment only if something still hangs under it
    const keep = new Set(all.filter(c => !c.is_deleted).map(c => c.id))
    let changed = true
    while (changed) {
      changed = false
      for (const c of all) {
        if (c.parent_id && keep.has(c.id) && !keep.has(c.parent_id)) {
          keep.add(c.parent_id)
          changed = true
        }
      }
    }

    const visible = all
      .filter(c => keep.has(c.id))
      .map(c => c.is_deleted
        ? { id: c.id, post_id: c.post_id, parent_id: c.parent_id, created_at: c.created_at, is_deleted: true, body: '', author_id: null, score: 0 }
        : c)

    const withAuthors = await attachAuthors(visible, supabase)

    // Your own votes, if you're logged in
    const myVotes: Record<string, 'up' | 'down'> = {}
    const user = await getUserFromRequest(request, supabase, { allowBanned: true })
    if (user && visible.length > 0) {
      const { data: votes } = await supabase
        .from('comment_votes')
        .select('comment_id, value')
        .eq('user_id', user.id)
        .in('comment_id', visible.map(c => c.id))
      for (const v of votes || []) myVotes[v.comment_id] = v.value === 1 ? 'up' : 'down'
    }

    return NextResponse.json({ comments: withAuthors, myVotes })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}