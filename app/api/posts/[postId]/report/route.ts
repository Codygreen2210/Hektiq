import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const REASONS: Record<string, string> = {
  bot: 'Bot or fake account',
  ai: 'AI-generated content',
  spam: 'Spam or advertising',
  harassment: 'Harassment or hate',
  other: 'Something else'
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { reason, details, username } = await request.json()

    if (!REASONS[reason]) return NextResponse.json({ error: 'Pick a reason.' })
    const note = (details || '').trim().slice(0, 1000)

    const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data: post } = await supabase
      .from('posts')
      .select('id, title, body, community_id')
      .eq('id', postId)
      .single()

    if (!post) return NextResponse.json({ error: 'That post no longer exists.' })

    const { count: already } = await supabase
      .from('post_reports')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('ip', ip)

    if ((already || 0) > 0) return NextResponse.json({ ok: true, duplicate: true })

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recent } = await supabase
      .from('post_reports')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', oneHourAgo)

    if ((recent || 0) >= 5) return NextResponse.json({ error: 'You\'ve sent a lot of reports. Try again in an hour.' })

    const { error } = await supabase.from('post_reports').insert({
      post_id: postId,
      community_id: post.community_id,
      reason,
      details: note || null,
      reporter_username: username || null,
      ip
    })

    if (error) return NextResponse.json({ error: 'Couldn\'t send that. Try again.' })

    const { count: total } = await supabase
      .from('post_reports')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId)

    const link = (process.env.NEXT_PUBLIC_SITE_URL || 'https://hektiq.com') + '/c/' + post.community_id + '/post/' + post.id

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY
      },
      body: JSON.stringify({
        from: 'Hektiq Reports <noreply@hektiq.com>',
        to: 'cody@hektiq.com',
        subject: 'Report: ' + REASONS[reason] + ' (' + (total || 1) + ' total on this post)',
        html: `
          <div style="font-family: sans-serif; max-width: 520px;">
            <p style="font-size: 13px; color: #666; margin: 0 0 8px;">${REASONS[reason]}${username ? ' · reported by ' + escapeHtml(username) : ''}</p>
            <p style="font-size: 16px; font-weight: 600; margin: 0 0 6px;">${escapeHtml(post.title)}</p>
            <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 12px;">${escapeHtml((post.body || '').slice(0, 300))}</p>
            ${note ? `<p style="font-size: 14px; margin: 0 0 12px;"><strong>Their note:</strong> ${escapeHtml(note)}</p>` : ''}
            <p style="margin: 0;"><a href="${link}">Open the post</a></p>
          </div>
        `
      })
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}