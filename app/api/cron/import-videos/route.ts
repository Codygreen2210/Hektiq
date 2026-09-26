import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { resolveChannels, latestFromChannels } from '../../../../lib/youtubeChannels'
import { parseVideo } from '../../../../lib/video'
import { seededBySlug } from '../../../../lib/communities'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const PER_COMMUNITY_PER_DAY = 20
const PER_CHANNEL_PER_DAY = 2
const SIMILAR_LIMIT = 0.6        // titles sharing 60%+ of their words count as the same video
const DUPLICATE_DAYS = 14

const FILLER = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'vs', 'is', 'my', 'this', 'from', 'by'])

function titleWords(t: string) {
  return new Set(
    (t.toLowerCase().match(/[a-z0-9']+/g) || []).filter(w => w.length > 1 && !FILLER.has(w))
  )
}

function similarity(a: Set<string>, b: Set<string>) {
  if (a.size === 0 || b.size === 0) return 0
  let shared = 0
  for (const w of a) if (b.has(w)) shared++
  return shared / Math.min(a.size, b.size)
}

export async function GET(request: Request) {
  // Only Vercel's scheduler (or you, with the secret) can run this
  const auth = request.headers.get('authorization') || ''
  if (!process.env.CRON_SECRET || auth !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Not allowed.' }, { status: 401 })
  }
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return NextResponse.json({ error: 'YOUTUBE_API_KEY is not set.' }, { status: 500 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false } }
  )

  const { data: bot } = await supabase
    .from('users')
    .select('id')
    .eq('username', 'hektiq_videos')
    .eq('is_bot', true)
    .maybeSingle()
  if (!bot) return NextResponse.json({ error: 'The hektiq_videos account is missing.' }, { status: 500 })

  // 1. Look up any new channel handles
  const lookups = await resolveChannels(supabase, key)

  // 2. Newest uploads from every channel
  const videos = await latestFromChannels(supabase, key)

  const { data: blockedRows } = await supabase.from('blocked_channels').select('name')
  const blocked = new Set((blockedRows || []).map(b => String(b.name).toLowerCase().trim()))

  // Recent imports, for the duplicate and per-channel checks
  const dupSince = new Date(Date.now() - DUPLICATE_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { data: recent } = await supabase
    .from('imported_videos')
    .select('video_id, title, channel, community_slug, created_at')
    .gte('created_at', dupSince)
  const seenIds = new Set((recent || []).map(r => r.video_id))
  const recentTitles = (recent || []).filter(r => r.title).map(r => titleWords(r.title))

  const dayAgoMs = Date.now() - 24 * 60 * 60 * 1000
  const channelCount: Record<string, number> = {}
  const room: Record<string, number> = {}
  for (const r of recent || []) {
    if (new Date(r.created_at).getTime() < dayAgoMs) continue
    if (r.channel) {
      const k = String(r.channel).toLowerCase().trim()
      channelCount[k] = (channelCount[k] || 0) + 1
    }
    room[r.community_slug] = (room[r.community_slug] || 0) + 1
  }
  for (const k of Object.keys(room)) room[k] = PER_COMMUNITY_PER_DAY - room[k]

  // Older imports we never saw in the 14-day window
  const { data: older } = videos.length
    ? await supabase.from('imported_videos').select('video_id').in('video_id', videos.map(v => v.id))
    : { data: [] as any[] }
  for (const o of older || []) seenIds.add(o.video_id)

  const report: Record<string, number> = {}
  const samples: Record<string, string[]> = {}
  const communityOk: Record<string, boolean> = {}

  for (const v of videos) {
    const slug = v.community
    if (report[slug] === undefined) { report[slug] = 0; samples[slug] = [] }
    if (room[slug] === undefined) room[slug] = PER_COMMUNITY_PER_DAY
    if (room[slug] <= 0) continue
    if (seenIds.has(v.id)) continue

    // Skip member communities that were deleted
    if (communityOk[slug] === undefined) {
      if (seededBySlug[slug]) communityOk[slug] = true
      else {
        const { data: c } = await supabase.from('communities').select('slug').eq('slug', slug).maybeSingle()
        communityOk[slug] = !!c
      }
    }
    if (!communityOk[slug]) continue

    const channelKey = v.channel.toLowerCase().trim()
    if (blocked.has(channelKey)) continue
    if ((channelCount[channelKey] || 0) >= PER_CHANNEL_PER_DAY) continue

    const words = titleWords(v.title)
    if (recentTitles.some(t => similarity(words, t) >= SIMILAR_LIMIT)) continue

    const parsed = parseVideo(v.url)
    if (!parsed) continue

    // Claim the video first so two runs can never post it twice
    const { error: claimErr } = await supabase
      .from('imported_videos')
      .insert({ video_id: v.id, community_slug: slug, title: v.title, channel: v.channel })
    if (claimErr) continue

    const credit = 'Found on YouTube from ' + v.channel + '.'
    const body = v.description ? v.description + '\n\n' + credit : credit

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title: v.title,
        body,
        community_id: slug,
        author_id: bot.id,
        video_url: parsed.canonical,
        image_urls: [],
      })
      .select('id')
      .single()

    if (error || !post) {
      await supabase.from('imported_videos').delete().eq('video_id', v.id)
      continue
    }

    await supabase.from('imported_videos').update({ post_id: post.id }).eq('video_id', v.id)
    seenIds.add(v.id)
    recentTitles.push(words)
    channelCount[channelKey] = (channelCount[channelKey] || 0) + 1
    report[slug]++
    if (samples[slug].length < 3) samples[slug].push(v.title + ' (' + v.channel + ')')
    room[slug]--
  }

  // Handles that couldn't be found, so you can fix them
  const { data: failedRows } = await supabase
    .from('video_channels')
    .select('handle, community_slug')
    .eq('lookup_failed', true)

  return NextResponse.json({
    ok: true,
    channelsLookedUp: lookups,
    freshVideosFound: videos.length,
    posted: report,
    examples: samples,
    handlesNotFound: (failedRows || []).map(f => f.community_slug + ': ' + f.handle),
  })
}