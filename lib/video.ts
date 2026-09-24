export type VideoInfo = {
  provider: 'youtube' | 'tiktok' | 'vimeo' | 'instagram' | 'twitch'
  id: string
  canonical: string
  vertical: boolean
  thumb: string | null
}

export const VIDEO_SITES = 'YouTube, TikTok, Vimeo, Instagram, or Twitch clips'

export function parseVideo(input: string): VideoInfo | null {
  let url: URL
  try {
    url = new URL(input.trim())
  } catch (e) {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '')
  const parts = url.pathname.split('/').filter(Boolean)

  if (host === 'youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') {
    let id = ''
    let vertical = false
    if (host === 'youtu.be') id = parts[0] || ''
    else if (parts[0] === 'watch') id = url.searchParams.get('v') || ''
    else if (parts[0] === 'shorts') { id = parts[1] || ''; vertical = true }
    else if (parts[0] === 'embed' || parts[0] === 'live') id = parts[1] || ''
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null
    return {
      provider: 'youtube',
      id,
      canonical: vertical ? 'https://www.youtube.com/shorts/' + id : 'https://www.youtube.com/watch?v=' + id,
      vertical,
      thumb: 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg',
    }
  }

  if (host === 'tiktok.com') {
    const i = parts.indexOf('video')
    const id = i >= 0 ? parts[i + 1] || '' : ''
    if (!/^\d{8,25}$/.test(id)) return null
    const user = parts[0] && parts[0].startsWith('@') ? parts[0] : '@tiktok'
    return { provider: 'tiktok', id, canonical: 'https://www.tiktok.com/' + user + '/video/' + id, vertical: true, thumb: null }
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parts.find(p => /^\d{5,15}$/.test(p)) || ''
    if (!id) return null
    return { provider: 'vimeo', id, canonical: 'https://vimeo.com/' + id, vertical: false, thumb: null }
  }

  if (host === 'instagram.com') {
    const kind = parts[0]
    const id = parts[1] || ''
    if (!['p', 'reel', 'reels', 'tv'].includes(kind) || !/^[A-Za-z0-9_-]{5,40}$/.test(id)) return null
    const isReel = kind === 'reel' || kind === 'reels'
    return {
      provider: 'instagram',
      id: (isReel ? 'reel/' : 'p/') + id,
      canonical: 'https://www.instagram.com/' + (isReel ? 'reel/' : 'p/') + id + '/',
      vertical: true,
      thumb: null,
    }
  }

  if (host === 'clips.twitch.tv' || host === 'twitch.tv') {
    let slug = ''
    if (host === 'clips.twitch.tv') slug = parts[0] === 'embed' ? url.searchParams.get('clip') || '' : parts[0] || ''
    else {
      const i = parts.indexOf('clip')
      slug = i >= 0 ? parts[i + 1] || '' : ''
    }
    if (!/^[A-Za-z0-9_-]{4,100}$/.test(slug)) return null
    return { provider: 'twitch', id: slug, canonical: 'https://clips.twitch.tv/' + slug, vertical: false, thumb: null }
  }

  return null
}

export function isShortTiktokLink(input: string) {
  try {
    const h = new URL(input.trim()).hostname.replace(/^www\./, '')
    return h === 'vm.tiktok.com' || h === 'vt.tiktok.com'
  } catch (e) {
    return false
  }
}

export function embedUrl(v: VideoInfo, hostname: string) {
  switch (v.provider) {
    case 'youtube': return 'https://www.youtube-nocookie.com/embed/' + v.id + '?rel=0'
    case 'tiktok': return 'https://www.tiktok.com/embed/v2/' + v.id
    case 'vimeo': return 'https://player.vimeo.com/video/' + v.id + '?dnt=1'
    case 'instagram': return 'https://www.instagram.com/' + v.id + '/embed'
    case 'twitch': return 'https://clips.twitch.tv/embed?clip=' + encodeURIComponent(v.id) + '&parent=' + encodeURIComponent(hostname) + '&autoplay=false'
  }
}

export function providerName(p: VideoInfo['provider']) {
  return { youtube: 'YouTube', tiktok: 'TikTok', vimeo: 'Vimeo', instagram: 'Instagram', twitch: 'Twitch' }[p]
}