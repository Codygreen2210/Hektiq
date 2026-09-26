// Searches YouTube for recent popular, safe, embeddable, English videos.
// Uses the free YouTube Data API. Each search costs 100 of the 10,000 free daily units.

const MIN_VIEWS = 300
const MIN_SECONDS = 60                     // no Shorts or tiny clips
const BLOCKED_CATEGORIES = new Set(['20', '25'])  // 20 = Gaming, 25 = News & Politics

export type FoundVideo = {
  id: string
  title: string
  channel: string
  description: string
  views: number
  url: string
  category: string
}

function decodeHtml(s: string) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

// Strips hashtags and extra spaces out of a title
function cleanTitle(raw: string) {
  let s = decodeHtml(raw || '')
  s = s.replace(/#[\p{L}\p{N}_-]+/gu, '')
  s = s.replace(/\s*\|\s*$/g, '')
  s = s.replace(/\s+/g, ' ').trim()
  return s.slice(0, 300)
}

// Strips links, hashtags, and clutter out of a YouTube description
function cleanDescription(raw: string) {
  let s = decodeHtml(raw || '')
  s = s.replace(/https?:\/\/\S+/gi, '')
  s = s.replace(/\bwww\.\S+/gi, '')
  s = s.replace(/#[\p{L}\p{N}_-]+/gu, '')
  s = s.replace(/\b(subscribe|like and subscribe|use code|promo code|affiliate)\b[^.!?]*[.!?]?/gi, '')
  s = s.replace(/\s+/g, ' ').trim()
  if (s.length > 280) s = s.slice(0, 279).trimEnd() + '…'
  return s
}

// Everyday English words. A title with none of these probably isn't English.
const ENGLISH_WORDS = new Set((
  'the a an and or but to of in on at for with from by vs is are was were be been it its this that these those ' +
  'my our your you we i me he she they them his her their how what why when where who which ' +
  'best first new big biggest huge top most more all every day days time week year years night today ' +
  'can will get got just make made makes making do does did doing go going went take took ' +
  'not no never ever only so too very really good great bad better worst last next back out up down off over ' +
  'one two three four five ten hundred thousand million full part first second final ' +
  'fishing fish catch caught hunting hunt duck deer hog bass boat lake river camp camping outdoor outdoors trip ' +
  'game games highlights football basketball baseball golf fight win wins won lose loss team teams season play plays player ' +
  'truck trucks engine build builds built rebuild swap repair fix fixing car cars diesel shop tools tool race racing restore restoration ' +
  'business money tips side hustle start started starting ideas invest investing stock stocks budget debt income pay job work ' +
  'project woodworking welding art made craft crafts paint painting drawing diy handmade maker wood metal ' +
  'review guide tutorial beginner beginners explained vlog episode live update reaction story life'
).split(' '))

// The title has to read like English, no matter what the video is tagged as
function looksEnglish(title: string) {
  const letters = title.replace(/[^\p{L}]/gu, '')
  if (letters.length === 0) return false
  const latin = letters.replace(/[^a-zA-Z]/g, '').length
  if (latin / letters.length < 0.9) return false
  const words = title.toLowerCase().match(/[a-z']+/g) || []
  return words.some(w => ENGLISH_WORDS.has(w))
}

function tagSaysNotEnglish(code?: string) {
  return !!code && !code.toLowerCase().startsWith('en')
}

// Turns YouTube's "PT1H2M30S" into seconds
function durationSeconds(iso?: string) {
  const m = (iso || '').match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return (Number(m[1] || 0) * 86400) + (Number(m[2] || 0) * 3600) + (Number(m[3] || 0) * 60) + Number(m[4] || 0)
}

async function searchWindow(query: string, hours: number, maxResults: number, key: string, categoryId?: string): Promise<FoundVideo[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    safeSearch: 'strict',
    videoEmbeddable: 'true',
    order: 'viewCount',
    publishedAfter: since,
    regionCode: 'US',
    relevanceLanguage: 'en',
    maxResults: String(maxResults),
    key,
  })
  if (categoryId) params.set('videoCategoryId', categoryId)

  const res = await fetch('https://www.googleapis.com/youtube/v3/search?' + params.toString(), { cache: 'no-store' }).catch(() => null)
  if (!res || !res.ok) return []
  const data = await res.json().catch(() => null)
  const items: any[] = data?.items || []
  const ids = items.map(i => i?.id?.videoId).filter(Boolean)
  if (ids.length === 0) return []

  // Views, embed status, language, length, and category (1 unit per call)
  const statsRes = await fetch(
    'https://www.googleapis.com/youtube/v3/videos?' + new URLSearchParams({ part: 'statistics,status,snippet,contentDetails', id: ids.join(','), key }).toString(),
    { cache: 'no-store' }
  ).catch(() => null)
  const info: Record<string, { views: number; embeddable: boolean; audioLang?: string; textLang?: string; seconds: number; category?: string }> = {}
  if (statsRes && statsRes.ok) {
    const sd = await statsRes.json().catch(() => null)
    for (const v of sd?.items || []) {
      info[v.id] = {
        views: Number(v?.statistics?.viewCount || 0),
        embeddable: v?.status?.embeddable !== false,
        audioLang: v?.snippet?.defaultAudioLanguage,
        textLang: v?.snippet?.defaultLanguage,
        seconds: durationSeconds(v?.contentDetails?.duration),
        category: v?.snippet?.categoryId,
      }
    }
  }

  return items
    .map(i => {
      const id = i?.id?.videoId
      const s = info[id]
      const rawTitle = decodeHtml(String(i?.snippet?.title || ''))
      const title = cleanTitle(rawTitle)

      const english = looksEnglish(title) && !tagSaysNotEnglish(s?.audioLang) && !tagSaysNotEnglish(s?.textLang)
      const isShort = /#shorts?\b/i.test(rawTitle) || (s ? s.seconds < MIN_SECONDS : true)
      const badCategory = !!s?.category && BLOCKED_CATEGORIES.has(s.category)

      return {
        id,
        title,
        channel: decodeHtml(String(i?.snippet?.channelTitle || '')),
        description: cleanDescription(String(i?.snippet?.description || '')),
        views: s ? s.views : 0,
        url: 'https://www.youtube.com/watch?v=' + id,
        category: s?.category || '',
        ok: !!s && s.embeddable && s.views >= MIN_VIEWS && english && !isShort && !badCategory,
      }
    })
    .filter(v => v.id && v.title && v.ok)
    .sort((a, b) => b.views - a.views)
    .map(({ ok, ...v }) => v)
}

// Today's most popular first. If nothing qualifies, look back 7 days.
// categoryId limits the search to one YouTube category (17 = Sports).
export async function searchYouTube(query: string, maxResults = 50, categoryId?: string): Promise<FoundVideo[]> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return []

  const today = await searchWindow(query, 24, maxResults, key, categoryId)
  if (today.length > 0) return today

  return searchWindow(query, 24 * 7, maxResults, key, categoryId)
}