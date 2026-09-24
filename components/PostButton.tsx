'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import VideoEmbed from './VideoEmbed'
import { getAuthHeader } from '../lib/authToken'
import { seededBySlug } from '../lib/communities'
import { parseVideo, isShortTiktokLink, VIDEO_SITES } from '../lib/video'
import { Plus, VideoCamera, X } from '@phosphor-icons/react'

const COLOR: Record<string, string> = {
  'outdoors': '4',
  'sports': '5',
  'money-building': '3',
  'garage': '1',
  'art-makers': '2',
}

type Choice = { slug: string; name: string }

export default function PostButton() {
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [choices, setChoices] = useState<Choice[]>([])
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [showVideo, setShowVideo] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const hidden = pathname.startsWith('/auth') || pathname.endsWith('/new-post')
  const onCommunityPage = /^\/c\/[^/]+$/.test(pathname)
  const pageSlug = pathname.startsWith('/c/') ? pathname.split('/')[2] : ''

  const trimmedVideo = videoUrl.trim()
  const video = trimmedVideo ? parseVideo(trimmedVideo) : null
  const shortTiktok = trimmedVideo ? isShortTiktokLink(trimmedVideo) : false
  const videoProblem = trimmedVideo && !video
    ? (shortTiktok ? 'That\'s a TikTok short link. Open it, then copy the full link from your browser.' : 'That link isn\'t supported. Use a link from ' + VIDEO_SITES + '.')
    : ''

  const n = COLOR[slug] || '2'
  const accent = `var(--c${n})`

  // Load community list once, the first time the sheet opens
  useEffect(() => {
    if (!open || choices.length > 0) return
    const main: Choice[] = Object.keys(seededBySlug).map(s => ({ slug: s, name: seededBySlug[s].name }))
    setChoices(main)
    fetch('/api/communities', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        const extra = (d.communities || [])
          .filter((c: any) => c.slug && !seededBySlug[c.slug])
          .map((c: any) => ({ slug: c.slug, name: c.name }))
        if (extra.length) setChoices([...main, ...extra])
      })
      .catch(() => {})
  }, [open, choices.length])

  function openSheet() {
    setLoggedIn(!!localStorage.getItem('hektiq_username'))
    setSlug(pageSlug || '')
    setError('')
    setOpen(true)
  }

  function closeSheet() {
    if (loading) return
    setOpen(false)
  }

  // Lock page scroll while sheet is open, Escape closes it
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSheet() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, loading])

  async function handleSubmit() {
    if (!slug) return setError('Pick a community.')
    if (!title.trim()) return setError('Add a title.')
    if (videoProblem) return setError(videoProblem)
    if (!body.trim() && !video) return setError('Add something in the body, or a video link.')
    setLoading(true)
    setError('')
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ title, body, community_slug: slug, video_url: video ? trimmedVideo : '' })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }
      setTitle(''); setBody(''); setVideoUrl(''); setShowVideo(false)
      window.location.href = '/c/' + slug + '/post/' + data.post.id
    } catch (e) {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  if (hidden) return null

  const labelStyle = {display:'block', fontSize:'1.1rem', margin:'0 0 6px'}

  return (
    <>
      <style>{`
        .hk-fab { position: fixed; right: 18px; width: 58px; height: 58px; border-radius: 50%; background: var(--c1); color: var(--on-c1); border: 2px solid var(--ink); box-shadow: var(--shadow-hard); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 30; transition: transform .12s ease; }
        .hk-fab:active { transform: translate(2px,2px); box-shadow: none; }
        [data-theme='night'] .hk-fab { background: rgba(14,7,25,.85); color: var(--c1); border-color: var(--c1); box-shadow: 0 0 14px var(--c1), inset 0 0 10px var(--c1); }
        .hk-sheet-bg { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 40; display: flex; align-items: flex-end; justify-content: center; }
        @media (min-width: 721px) { .hk-sheet-bg { align-items: center; } }
        .hk-sheet { width: 100%; max-width: 620px; max-height: 92dvh; overflow-y: auto; background: var(--bg); border: 2px solid var(--ink); border-top: 6px solid var(--tube); border-radius: 16px 16px 0 0; padding: 18px 18px 28px; color: var(--text); }
        @media (min-width: 721px) { .hk-sheet { border-radius: 14px; } }
        [data-theme='night'] .hk-sheet { border-color: var(--tube); box-shadow: 0 0 22px -6px var(--tube); }
        .hk-sheet .hk-input:focus { border-color: var(--tube); }
        .hk-pick { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
        .hk-pick button { flex-shrink: 0; padding: 7px 12px; border-radius: 6px; font-weight: 700; font-size: .85rem; cursor: pointer; border: 2px solid var(--border-soft); background: var(--surface); color: var(--muted); }
        .hk-pick button.on { background: var(--pick); color: var(--pick-on); border-color: var(--ink); }
        [data-theme='night'] .hk-pick button.on { background: transparent; color: var(--pick); border-color: var(--pick); box-shadow: 0 0 8px var(--pick); }
        .hk-add-video { display:inline-flex; align-items:center; gap:8px; background: var(--surface-2); color: var(--text); border: 2px dashed var(--border-soft); border-radius: 8px; padding: 10px 14px; font-weight: 700; font-size: 0.9rem; cursor: pointer; }
        .hk-add-video:hover { border-color: var(--tube); }
      `}</style>

      <button
        className='hk-fab'
        onClick={openSheet}
        aria-label='Make a post'
        style={{ bottom: onCommunityPage ? '90px' : '22px' }}
      >
        <Plus size={28} weight='bold' />
      </button>

      {open && (
        <div className='hk-sheet-bg' onClick={closeSheet}>
          <div
            className='hk-sheet'
            role='dialog'
            aria-modal='true'
            aria-label='New post'
            onClick={e => e.stopPropagation()}
            style={{ ['--tube' as any]: accent }}
          >
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px'}}>
              <h2 className='font-display' style={{fontSize:'2.2rem', lineHeight:1, margin:0}}>NEW POST</h2>
              <button onClick={closeSheet} aria-label='Close' style={{background:'none', border:'none', color:'var(--muted)', cursor:'pointer', display:'flex', padding:'6px'}}>
                <X size={22} weight='bold' />
              </button>
            </div>

            {loggedIn === false ? (
              <div style={{padding:'12px 0', textAlign:'center'}}>
                <p style={{margin:'0 0 16px'}}>Log in to post. It keeps the fake accounts out.</p>
                <div style={{display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap'}}>
                  <Link href='/auth/login' className='hk-btn-ghost'>Log in</Link>
                  <Link href='/auth/signup' className='hk-btn'>Join free</Link>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div style={{border:'2px solid var(--c1)', borderRadius:'8px', padding:'10px 12px', marginBottom:'14px', color:'var(--c1)', fontSize:'0.9rem', fontWeight:600}}>
                    {error}
                  </div>
                )}

                <div style={{marginBottom:'16px'}}>
                  <label className='font-display' style={labelStyle}>COMMUNITY</label>
                  <div className='hk-pick'>
                    {choices.map(c => {
                      const cn = COLOR[c.slug] || '2'
                      return (
                        <button
                          key={c.slug}
                          type='button'
                          className={slug === c.slug ? 'on' : ''}
                          onClick={() => { setSlug(c.slug); setError('') }}
                          style={{ ['--pick' as any]: `var(--c${cn})`, ['--pick-on' as any]: `var(--on-c${cn})` }}
                        >
                          {c.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{marginBottom:'16px'}}>
                  <label className='font-display' style={labelStyle}>TITLE</label>
                  <input
                    type='text'
                    value={title}
                    onChange={e => { setTitle(e.target.value); setError('') }}
                    placeholder='What do you want to talk about?'
                    maxLength={300}
                    className='hk-input'
                    style={{fontSize:'1.05rem', fontWeight:600}}
                  />
                </div>

                <div style={{marginBottom:'16px'}}>
                  {!showVideo ? (
                    <button type='button' onClick={() => setShowVideo(true)} className='hk-add-video'>
                      <VideoCamera size={18} weight='bold' />
                      Add a video link
                    </button>
                  ) : (
                    <>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px'}}>
                        <label className='font-display' style={{fontSize:'1.1rem', margin:0}}>VIDEO LINK</label>
                        <button type='button' onClick={() => { setShowVideo(false); setVideoUrl('') }} aria-label='Remove video' style={{background:'none', border:'none', color:'var(--faint)', cursor:'pointer', display:'flex', padding:'4px'}}>
                          <X size={18} weight='bold' />
                        </button>
                      </div>
                      <input
                        type='url'
                        value={videoUrl}
                        onChange={e => { setVideoUrl(e.target.value); setError('') }}
                        placeholder='Paste a YouTube, TikTok, Vimeo, Instagram, or Twitch clip link'
                        className='hk-input'
                      />
                      {videoProblem ? (
                        <p style={{color:'var(--c1)', fontSize:'0.85rem', fontWeight:600, margin:'8px 0 0'}}>{videoProblem}</p>
                      ) : !trimmedVideo ? (
                        <p style={{color:'var(--faint)', fontSize:'0.8rem', margin:'8px 0 0'}}>Copy the link from the Share button on the video.</p>
                      ) : null}
                      {video && (
                        <div style={{marginTop:'14px'}}>
                          <VideoEmbed url={trimmedVideo} />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div style={{marginBottom:'18px'}}>
                  <label className='font-display' style={labelStyle}>{video ? 'BODY (OPTIONAL)' : 'BODY'}</label>
                  <textarea
                    value={body}
                    onChange={e => { setBody(e.target.value); setError('') }}
                    placeholder={video ? 'Say something about the video...' : 'Share the details...'}
                    rows={video ? 3 : 6}
                    className='hk-input'
                    style={{resize:'vertical', lineHeight:'1.7'}}
                  />
                </div>

                <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                  <button onClick={handleSubmit} disabled={loading} className='hk-btn'>
                    {loading ? 'Posting...' : 'Post it'}
                  </button>
                  <button onClick={closeSheet} className='hk-btn-ghost'>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}