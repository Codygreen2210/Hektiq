'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import VideoEmbed from './VideoEmbed'
import { parseVideo } from '../lib/video'
import { getAuthHeader } from '../lib/authToken'
import { ArrowFatUp, ArrowFatDown, ChatCircle } from '@phosphor-icons/react'

export type FeedPost = {
  id: string
  title: string
  community_id: string
  upvotes: number
  comment_count: number
  author_username: string
  video_url: string
}

const COLORS: Record<string, string> = {
  outdoors: 'var(--c4)',
  sports: 'var(--c5)',
  'money-building': 'var(--c3)',
  garage: 'var(--c1)',
  'art-makers': 'var(--c2)',
}

export default function VideoFeed({ posts }: { posts: FeedPost[] }) {
  const [active, setActive] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [myVotes, setMyVotes] = useState<Record<string, 'up' | 'down' | null>>({})
  const [msg, setMsg] = useState('')
  const slides = useRef<(HTMLDivElement | null)[]>([])

  // Only the video on screen loads
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            setActive(Number((e.target as HTMLElement).dataset.index))
          }
        }
      },
      { threshold: [0.6] }
    )
    slides.current.forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [posts])

  async function vote(postId: string, direction: 'up' | 'down') {
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/posts/' + postId + '/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ direction }),
      })
      const data = await res.json()
      if (data.error) {
        setMsg(data.error)
        setTimeout(() => setMsg(''), 2500)
        return
      }
      setScores((s) => ({ ...s, [postId]: data.upvotes }))
      setMyVotes((v) => ({ ...v, [postId]: data.myVote }))
    } catch (e) {
      setMsg('Something went wrong.')
      setTimeout(() => setMsg(''), 2500)
    }
  }

  if (posts.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 16px' }}>No videos yet. Post one in any community.</p>
  }

  return (
    <div className='hk-feed'>
      <style>{`
        .hk-feed { height: calc(100dvh - 120px); overflow-y: scroll; scroll-snap-type: y mandatory; overscroll-behavior: contain; background: #000; border-radius: 10px; }
        .hk-slide { position: relative; height: 100%; scroll-snap-align: start; scroll-snap-stop: always; display: flex; align-items: center; justify-content: center; }
        .hk-slide-video { position: absolute; inset: 0; }
        .hk-slide-thumb { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .5; }
        .hk-slide-info { position: absolute; left: 0; right: 70px; bottom: 0; padding: 16px; background: linear-gradient(transparent, rgba(0,0,0,.8)); color: #fff; pointer-events: none; }
        .hk-slide-info a { pointer-events: auto; }
        .hk-chip { display: inline-block; font-size: .75rem; font-weight: 800; padding: 3px 9px; border-radius: 999px; color: #111; text-decoration: none; margin-bottom: 6px; }
        [data-theme='night'] .hk-chip { background: transparent !important; color: var(--chip) !important; border: 1.5px solid var(--chip); box-shadow: 0 0 8px var(--chip); }
        .hk-slide-title { font-weight: 700; font-size: 1rem; margin: 0 0 4px; }
        .hk-slide-by { font-size: .8rem; opacity: .8; margin: 0; }
        .hk-rail { position: absolute; right: 10px; bottom: 90px; display: flex; flex-direction: column; align-items: center; gap: 14px; color: #fff; }
        .hk-rail button, .hk-rail a { background: rgba(0,0,0,.5); border: none; color: #fff; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; text-decoration: none; }
        .hk-rail .on { color: var(--c3); }
        .hk-rail span { font-size: .8rem; font-weight: 800; }
        .hk-toast { position: fixed; left: 50%; bottom: 30px; transform: translateX(-50%); background: var(--ink); color: var(--bg); padding: 8px 14px; border-radius: 8px; font-size: .85rem; font-weight: 700; z-index: 50; }
      `}</style>

      {posts.map((p, i) => {
        const v = parseVideo(p.video_url)
        const color = COLORS[p.community_id] || 'var(--c2)'
        const score = scores[p.id] ?? p.upvotes ?? 0
        const mine = myVotes[p.id]
        const near = Math.abs(i - active) <= 0

        return (
          <div
            key={p.id}
            className='hk-slide'
            data-index={i}
            ref={(el) => { slides.current[i] = el }}
          >
            <div className='hk-slide-video'>
              {near && v ? (
                <VideoEmbed url={p.video_url} autoplay fill />
              ) : (
                v?.thumb && <img className='hk-slide-thumb' src={v.thumb} alt='' loading='lazy' />
              )}
            </div>

            <div className='hk-slide-info'>
              <Link
                href={'/c/' + p.community_id}
                className='hk-chip'
                style={{ background: color, ['--chip' as string]: color } as React.CSSProperties}
              >
                {p.community_id}
              </Link>
              <p className='hk-slide-title'>{p.title}</p>
              <p className='hk-slide-by'>by {p.author_username}</p>
            </div>

            <div className='hk-rail'>
              <button onClick={() => vote(p.id, 'up')} className={mine === 'up' ? 'on' : ''} aria-label='Upvote'>
                <ArrowFatUp size={26} weight={mine === 'up' ? 'fill' : 'bold'} />
              </button>
              <span>{score}</span>
              <button onClick={() => vote(p.id, 'down')} className={mine === 'down' ? 'on' : ''} aria-label='Downvote'>
                <ArrowFatDown size={26} weight={mine === 'down' ? 'fill' : 'bold'} />
              </button>
              <Link href={'/c/' + p.community_id + '/post/' + p.id} aria-label='Comments'>
                <ChatCircle size={26} weight='bold' />
              </Link>
              <span>{p.comment_count}</span>
            </div>
          </div>
        )
      })}

      {msg && <div className='hk-toast'>{msg}</div>}
    </div>
  )
}