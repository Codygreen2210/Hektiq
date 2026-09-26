import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const REASONS: Record<string, string> = {
  minor: 'Involves a minor or child safety',
  violence: 'Threats or violence',
  harassment: 'Harassment or hate',
  spam: 'Spam or advertising',
  bot: 'Bot or fake account',
  fake: 'Fake or copied content',
  other: 'Something else'
}

// Reasons serious enough to hide the post after a single report
const HIDE_RIGHT_AWAY = new Set(['minor'])

// Reports from this many different networks hide a post
const HIDE_AFTER = 3

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
      .select('id, title, body, community_id, is_deleted, auto_hidden')
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

    // How many different networks have reported this post
    const { data: allReports } = await supabase
      .from('post_reports')
      .select('ip')
      .eq('post_id', postId)
    const total = (allReports || []).length
    const distinct = new Set((allReports || []).map(r => r.ip)).size

    // Auto-hide
    let hiddenNow = false
    const shouldHide = HIDE_RIGHT_AWAY.has(reason) || distinct >= HIDE_AFTER
    if (shouldHide && !post.is_deleted) {
      const { error: hideErr } = await supabase
        .from('posts')
        .update({ is_deleted: true, auto_hidden: true, hidden_at: new Date().toISOString() })
        .eq('id', postId)
      if (!hideErr) hiddenNow = true
    }

    const link = (process.env.NEXT_PUBLIC_SITE_URL || 'https://hektiq.com') + '/c/' + post.community_id + '/post/' + post.id
    const subject = (hiddenNow ? 'HIDDEN: ' : '') + 'Report: ' + REASONS[reason] + ' (' + total + ' total on this post)'

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY
      },
      body: JSON.stringify({
        from: 'Hektiq Reports <noreply@hektiq.com>',
        to: 'cody@hektiq.com',
        subject,
        html: `
          <div style="font-family: sans-serif; max-width: 520px;">
            ${hiddenNow ? `<p style="background: #FDECEA; border: 1px solid #E4502F; padding: 10px 12px; border-radius: 6px; font-size: 14px; margin: 0 0 12px;"><strong>This post was hidden automatically.</strong> ${reason === 'minor' ? 'It was reported for child safety. If it involves a minor, report it at report.cybertip.org before removing it for good.' : 'It was reported from ' + distinct + ' different networks.'} Review it and bring it back or remove it.</p>` : ''}
            <p style="font-size: 13px; color: #666; margin: 0 0 8px;">${REASONS[reason]}${username ? ' · reported by ' + escapeHtml(String(username)) : ''}</p>
            <p style="font-size: 16px; font-weight: 600; margin: 0 0 6px;">${escapeHtml(post.title)}</p>
            <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 12px;">${escapeHtml((post.body || '').slice(0, 300))}</p>
            ${note ? `<p style="font-size: 14px; margin: 0 0 12px;"><strong>Their note:</strong> ${escapeHtml(note)}</p>` : ''}
            <p style="margin: 0;"><a href="${link}">Open the post</a> (hidden posts only show up in the admin review screen)</p>
          </div>
        `
      })
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}