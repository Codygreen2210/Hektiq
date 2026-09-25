'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import VideoFeed, { FeedPost } from '../../components/VideoFeed'
import FounderChip from '../../components/FounderChip'
import { getAuthHeader } from '../../lib/authToken'
import { ArrowFatUp, ChatCircle } from '@phosphor-icons/react'

type Post = FeedPost & { body: string | null; created_at: string; image_urls?: string[]; author_founder_number?: number | null }

const COLORS: Record<string, string> = {
  outdoors: 'var(--c4)',
  sports: 'var(--c5)',
  'money-building': 'var(--c3)',
  garage: 'var(--c1)',
  'art-makers': 'var(--c2)',
}

function timeAgo(date: string) {
  const h = Math.floor((Date.now() - new Date(date).getTime()) / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return h + 'h ago'
  return Math.floor(h / 24) + 'd ago'
}

export default function TrendingPage() {
  const [tab, setTab] = useState<'posts' | 'videos'>('posts')
  const [scope, setScope] = useState<'everyone' | 'following'>('everyone')
  const [posts, setPosts] = useState<Post[]>([])
  const [following, setFollowing] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('hektiq_username'))
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      setFollowing(null)

      if (scope === 'following' && !localStorage.getItem('hektiq_username')) {
        setPosts([])
        setLoading(false)
        return
      }

      try {
        const auth = scope === 'following' ? await getAuthHeader() : {}
        const url = '/api/trending?type=' + tab + (scope === 'following' ? '&following=1' : '')
        const r = await fetch(url, { headers: { ...auth }, cache: 'no-store' })
        const d = await r.json()
        if (cancelled) return
        if (d.error) setError(d.error)
        else {
          setPosts(d.posts || [])
          setFollowing(d.following ?? null)
        }
      } catch (e) {
        if (!cancelled) setError('Could not load trending.')
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [tab, scope])

  const emptyBox = { padding: '28px 16px', textAlign: 'center' as const, color: 'var(--muted)', borderStyle: 'dashed' }

  function emptyState() {
    if (scope === 'following' && !loggedIn) {
      return (
        <div className='hk-card' style={emptyBox}>
          <p style={{ margin: '0 0 14px' }}>Log in to see what's trending in the communities you've joined.</p>
          <Link href='/auth/login' className='hk-btn'>Log in</Link>
        </div>
      )
    }
    if (scope === 'following' && following && following.length === 0) {
      return (
        <div className='hk-card' style={emptyBox}>
          <p style={{ margin: '0 0 14px' }}>You haven't joined any communities yet. Hit Join on the ones you like and their best stuff shows up here.</p>
          <Link href='/communities' className='hk-btn'>Browse communities</Link>
        </div>
      )
    }
    return (
      <div className='hk-card' style={emptyBox}>
        {tab === 'videos'
          ? 'No videos yet. Post one in any community.'
          : 'Nothing trending yet. Start a conversation in any community.'}
      </div>
    )
  }

  return (
    <div className='hk-dots' style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <Header />
      <style>{`
        .hk-tabs { display: flex; gap: 10px; margin: 18px 0 10px; }
        .hk-tab { flex: 1; padding: 10px; font-size: 1.3rem; letter-spacing: .04em; border: 2px solid var(--ink); border-radius: 10px; background: var(--surface); color: var(--ink); cursor: pointer; }
        .hk-tab.on { background: var(--c1); color: var(--on-c1); box-shadow: var(--shadow-hard); }
        [data-theme='night'] .hk-tab { background: transparent; border-color: var(--border); color: var(--muted); }
        [data-theme='night'] .hk-tab.on { border-color: var(--c1); color: var(--c1); box-shadow: 0 0 12px var(--c1), inset 0 0 8px var(--c1); }
        .hk-scope { display: flex; gap: 8px; margin: 0 0 16px; }
        .hk-scope button { border-radius: 6px; padding: 7px 14px; min-height: 38px; font-size: .85rem; font-weight: 700; cursor: pointer; border: 2px solid var(--border-soft); background: transparent; color: var(--muted); }
        .hk-scope button.on { border-color: var(--border); color: var(--text); background: var(--surface-2); }
        .hk-trend-card { display: flex; gap: 12px; padding: 14px 16px; margin-bottom: 12px; text-decoration: none; color: var(--text); }
        .hk-trend-main { flex: 1; min-width: 0; }
        .hk-trend-top { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .hk-trend-chip { display: inline-block; font-size: .72rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; color: #111; margin-right: 2px; }
        [data-theme='night'] .hk-trend-chip { background: transparent !important; color: var(--chip) !important; border: 1.5px solid var(--chip); }
        .hk-trend-meta { font-size: .78rem; color: var(--faint); }
        .hk-trend-title { font-weight: 700; font-size: 1.05rem; margin: 8px 0 4px; color: var(--ink); word-break: break-word; }
        .hk-trend-body { font-size: .9rem; color: var(--muted); margin: 0 0 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .hk-trend-stats { display: flex; gap: 16px; font-size: .82rem; font-weight: 700; color: var(--muted); }
        .hk-trend-stats span { display: flex; align-items: center; gap: 4px; }
        .hk-trend-thumb { position: relative; flex-shrink: 0; width: 84px; height: 84px; border-radius: 8px; overflow: hidden; border: 2px solid var(--border-soft); align-self: center; }
        .hk-trend-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hk-trend-more { position: absolute; right: 4px; bottom: 4px; background: rgba(0,0,0,.72); color: #fff; font-size: .7rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
      `}</style>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '0 14px 40px' }}>
        <h1 className='font-display hk-neon-text' style={{ fontSize: '2.6rem', margin: '20px 0 0', color: 'var(--ink)' }}>
          TRENDING
        </h1>
        <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '.9rem' }}>
          What people are talking about across Hektiq this week.
        </p>

        <div className='hk-tabs'>
          <button className={'hk-tab font-display' + (tab === 'posts' ? ' on' : '')} onClick={() => setTab('posts')}>
            POSTS
          </button>
          <button className={'hk-tab font-display' + (tab === 'videos' ? ' on' : '')} onClick={() => setTab('videos')}>
            VIDEOS
          </button>
        </div>

        <div className='hk-scope' role='tablist' aria-label='Whose posts'>
          <button role='tab' aria-selected={scope === 'everyone'} className={scope === 'everyone' ? 'on' : ''} onClick={() => setScope('everyone')}>
            Everyone
          </button>
          <button role='tab' aria-selected={scope === 'following'} className={scope === 'following' ? 'on' : ''} onClick={() => setScope('following')}>
            Following
          </button>
        </div>

        {loading && <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Loading...</p>}
        {!loading && error && <p style={{ textAlign: 'center', color: 'var(--c1)' }}>{error}</p>}

        {!loading && !error && posts.length === 0 && emptyState()}

        {!loading && !error && posts.length > 0 && tab === 'videos' && <VideoFeed posts={posts} />}

        {!loading && !error && posts.length > 0 && tab === 'posts' && posts.map((p) => {
          const color = COLORS[p.community_id] || 'var(--c2)'
          const photos = Array.isArray(p.image_urls) ? p.image_urls : []
          return (
            <Link key={p.id} href={'/c/' + p.community_id + '/post/' + p.id} className='hk-card hk-trend-card'>
              <div className='hk-trend-main'>
                <div className='hk-trend-top'>
                  <span className='hk-trend-chip' style={{ background: color, ['--chip' as string]: color } as React.CSSProperties}>
                    {p.community_id}
                  </span>
                  <span className='hk-trend-meta'>by {p.author_username}</span>
                  <FounderChip number={p.author_founder_number} />
                  <span className='hk-trend-meta'>· {timeAgo(p.created_at)}</span>
                </div>
                <p className='hk-trend-title'>{p.title}</p>
                {p.body && <p className='hk-trend-body'>{p.body}</p>}
                <div className='hk-trend-stats'>
                  <span><ArrowFatUp size={16} weight='bold' /> {p.upvotes || 0}</span>
                  <span><ChatCircle size={16} weight='bold' /> {p.comment_count}</span>
                </div>
              </div>
              {photos.length > 0 && (
                <div className='hk-trend-thumb'>
                  <img src={photos[0]} alt='' loading='lazy' />
                  {photos.length > 1 && <span className='hk-trend-more'>+{photos.length - 1}</span>}
                </div>
              )}
            </Link>
          )
        })}
      </main>
    </div>
  )
}