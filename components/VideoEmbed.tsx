'use client'
import { useState, useEffect } from 'react'
import { parseVideo, embedUrl, providerName } from '../lib/video'
import { Play } from '@phosphor-icons/react'

type Props = {
  url: string
  autoplay?: boolean // start right away, muted (YouTube, Vimeo, Twitch)
  fill?: boolean     // fill the parent box (used by the swipe feed)
}

export default function VideoEmbed({ url, autoplay = false, fill = false }: Props) {
  const [playing, setPlaying] = useState(autoplay)
  const [host, setHost] = useState('hektiq.com')
  const v = parseVideo(url)

  useEffect(() => { setHost(window.location.hostname) }, [])
  useEffect(() => { setPlaying(autoplay) }, [autoplay, url])

  if (!v) return null

  const tall = v.provider === 'tiktok' ? 740 : v.provider === 'instagram' ? 620 : 0
  const boxStyle: React.CSSProperties = fill
    ? { width: '100%', height: '100%' }
    : v.vertical
      ? { width: '100%', maxWidth: '340px', height: tall || 600, margin: '0 auto' }
      : { width: '100%', aspectRatio: '16 / 9' }

  return (
    <div className='hk-video' style={fill ? { width: '100%', height: '100%' } : { margin: '0 0 18px' }}>
      <style>{`
        .hk-video-frame { position: relative; border: 2px solid var(--ink); border-radius: 10px; overflow: hidden; background: #0B0B0B; box-shadow: var(--shadow-hard); }
        [data-theme='night'] .hk-video-frame { border-color: var(--tube, var(--c1)); box-shadow: 0 0 14px var(--tube, var(--c1)); }
        .hk-video-frame.hk-fill { border: none; border-radius: 0; box-shadow: none; }
        [data-theme='night'] .hk-video-frame.hk-fill { box-shadow: none; }
        .hk-video-cover { position: absolute; inset: 0; width: 100%; height: 100%; border: none; padding: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #2A1F16, #4A3A2A); }
        [data-theme='night'] .hk-video-cover { background: linear-gradient(135deg, #160C26, #2B1147); }
        .hk-video-cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .hk-play { position: relative; width: 68px; height: 68px; border-radius: 50%; background: var(--c1); color: #fff; border: 3px solid #fff; display: flex; align-items: center; justify-content: center; transition: transform .15s ease; }
        .hk-video-cover:hover .hk-play { transform: scale(1.08); }
        [data-theme='night'] .hk-play { background: transparent; border-color: var(--c1); color: var(--c1); box-shadow: 0 0 16px var(--c1), inset 0 0 10px var(--c1); }
        .hk-video-tag { position: absolute; left: 10px; bottom: 10px; background: rgba(0,0,0,.72); color: #fff; font-size: 0.78rem; font-weight: 700; padding: 4px 9px; border-radius: 5px; }
      `}</style>

      <div className={'hk-video-frame' + (fill ? ' hk-fill' : '')} style={boxStyle}>
        {playing ? (
          <iframe
            src={embedUrl(v, host, autoplay)}
            title={providerName(v.provider) + ' video'}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
            allowFullScreen
            loading={autoplay ? 'eager' : 'lazy'}
            referrerPolicy='strict-origin-when-cross-origin'
          />
        ) : (
          <button className='hk-video-cover' onClick={() => setPlaying(true)} aria-label={'Play ' + providerName(v.provider) + ' video'}>
            {v.thumb && <img src={v.thumb} alt='' loading='lazy' />}
            <span className='hk-play'><Play size={30} weight='fill' /></span>
            <span className='hk-video-tag'>{providerName(v.provider)}</span>
          </button>
        )}
      </div>

      {!fill && (
        <p style={{ fontSize: '0.8rem', margin: '8px 0 0', textAlign: v.vertical ? 'center' : 'left' }}>
          <a href={v.canonical} target='_blank' rel='noopener noreferrer' style={{ color: 'var(--faint)', fontWeight: 600 }}>
            Watch on {providerName(v.provider)}
          </a>
        </p>
      )}
    </div>
  )
}