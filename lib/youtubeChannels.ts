import { SupabaseClient } from '@supabase/supabase-js'

// Pulls the newest uploads from a list of trusted YouTube channels.
// Looking up a channel or its uploads costs 1 unit each (a search costs 100).

const MIN_SECONDS = 60          // no Shorts or tiny clips
const MAX_AGE_DAYS = 3          // only fresh uploads
const PER_CHANNEL = 5           // newest uploads checked per channel
const BATCH = 10                // channels looked up at the same time

export type ChannelVideo = {
  id: string
  title: string
  channel: string
  description: string
  url: string
  community: string
  publishedAt: number
}

function decodeHtml(s: string) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function cleanTitle(raw: string) {
  let s = decodeHtml(raw || '')
  s = s.replace(/#[\p{L}\p{N}_-]+/gu, '')
  s = s.replace(/\s*\|\s*$/g, '')
  s = s.replace(/\s+/g, ' ').trim()
  return s.slice(0, 300)
}

function cleanDescription(raw: string) {
  let s = decodeHtml(raw || '')
  s = s.split('\n').slice(0, 4).join(' ')        // just the top of the description
  s = s.replace(/https?:\/\/\S+/gi, '')
  s = s.replace(/\bwww\.\S+/gi, '')
  s = s.replace(/#[\p{L}\p{N}_-]+/gu, '')
  s = s.replace(/\b(subscribe|like and subscribe|use code|promo code|affiliate|sponsored by)\b[^.!?]*[.!?]?/gi, '')
  s = s.replace(/\s+/g, ' ').trim()
  if (s.length > 280) s = s.slice(0, 279).trimEnd() + '…'
  return s
}

// Title can't have non-English letters like ç, ğ, ş, ñ, or other alphabets
function looksEnglish(title: string) {
  const letters = title.replace(/[^\p{L}]/gu, '')
  if (letters.length === 0) return false
  const plain = letters.replace(/[^a-zA-Z]/g, '').length
  return plain / letters.length >= 0.97
}

function durationSeconds(iso?: string) {
  const m = (iso || '').match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return (Number(m[1] || 0) * 86400) + (Number(m[2] || 0) * 3600) + (Number(m[3] || 0) * 60) + Number(m[4] || 0)
}

async function getJson(url: string) {
  const res = await fetch(url, { cache: 'no-store' }).catch(() => null)
  if (!res || !res.ok) return null
  return res.json().catch(() => null)
}

// Turns handles into channel IDs and upload lists. Only runs for new ones.
export async function resolveChannels(supabase: SupabaseClient, key: string) {
  const { data: rows } = await supabase
    .from('video_channels')
    .select('handle')
    .is('channel_id', null)
    .eq('lookup_failed', false)
    .limit(250)

  const list = rows || []
  let found = 0
  let failed = 0

  for (let i = 0; i < list.length; i += BATCH) {
    const chunk = list.slice(i, i + BATCH)
    await Promise.all(chunk.map(async r => {
      const handle = String(r.handle).replace(/^@/, '')
      const d = await getJson('https://www.googleapis.com/youtube/v3/channels?' + new URLSearchParams({
        part: 'snippet,contentDetails', forHandle: '@' + handle, key,
      }).toString())
      const ch = d?.items?.[0]
      const uploads = ch?.contentDetails?.relatedPlaylists?.uploads
      if (ch?.id && uploads) {
        await supabase.from('video_channels').update({
          channel_id: ch.id, uploads_playlist: uploads, title: ch?.snippet?.title || null,
        }).eq('handle', r.handle)
        found++
      } else {
        await supabase.from('video_channels').update({ lookup_failed: true }).eq('handle', r.handle)
        failed++
      }
    }))
  }
  return { found, failed }
}

// Newest good uploads from every active channel
export async function latestFromChannels(supabase: SupabaseClient, key: string): Promise<ChannelVideo[]> {
  const { data: chans } = await supabase
    .from('video_channels')
    .select('handle, community_slug, uploads_playlist, title')
    .eq('active', true)
    .not('uploads_playlist', 'is', null)

  const channels = chans || []
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000

  // Step 1: newest upload IDs from each channel
  const candidates: { id: string; community: string; channel: string; publishedAt: number }[] = []
  for (let i = 0; i < channels.length; i += BATCH) {
    const chunk = channels.slice(i, i + BATCH)
    await Promise.all(chunk.map(async c => {
      const d = await getJson('https://www.googleapis.com/youtube/v3/playlistItems?' + new URLSearchParams({
        part: 'contentDetails', playlistId: c.uploads_playlist, maxResults: String(PER_CHANNEL), key,
      }).toString())
      for (const it of d?.items || []) {
        const id = it?.contentDetails?.videoId
        const at = new Date(it?.contentDetails?.videoPublishedAt || 0).getTime()
        if (id && at >= cutoff) candidates.push({ id, community: c.community_slug, channel: c.title || c.handle, publishedAt: at })
      }
    }))
  }
  if (candidates.length === 0) return []

  // Step 2: details for those videos, 50 at a time
  const details: Record<string, any> = {}
  for (let i = 0; i < candidates.length; i += 50) {
    const ids = candidates.slice(i, i + 50).map(c => c.id)
    const d = await getJson('https://www.googleapis.com/youtube/v3/videos?' + new URLSearchParams({
      part: 'snippet,contentDetails,status', id: ids.join(','), key,
    }).toString())
    for (const v of d?.items || []) details[v.id] = v
  }

  const out: ChannelVideo[] = []
  for (const c of candidates) {
    const v = details[c.id]
    if (!v) continue
    if (v?.status?.embeddable === false) continue
    if (v?.status?.privacyStatus && v.status.privacyStatus !== 'public') continue
    if (v?.contentDetails?.contentRating?.ytRating === 'ytAgeRestricted') continue
    if (v?.snippet?.liveBroadcastContent && v.snippet.liveBroadcastContent !== 'none') continue

    const rawTitle = decodeHtml(String(v?.snippet?.title || ''))
    if (/#shorts?\b/i.test(rawTitle)) continue
    if (durationSeconds(v?.contentDetails?.duration) < MIN_SECONDS) continue

    const title = cleanTitle(rawTitle)
    if (!title || !looksEnglish(title)) continue

    out.push({
      id: c.id,
      title,
      channel: decodeHtml(String(v?.snippet?.channelTitle || c.channel)),
      description: cleanDescription(String(v?.snippet?.description || '')),
      url: 'https://www.youtube.com/watch?v=' + c.id,
      community: c.community,
      publishedAt: c.publishedAt,
    })
  }

  // Newest first
  return out.sort((a, b) => b.publishedAt - a.publishedAt)
}