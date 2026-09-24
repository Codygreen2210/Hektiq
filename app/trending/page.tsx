'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import VideoFeed, { FeedPost } from '../../components/VideoFeed'
import { ArrowFatUp, ChatCircle } from '@phosphor-icons/react'

type Post = FeedPost & { body: string | null; created_at: string }

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
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch('/api/trending?type=' + tab, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setPosts(d.posts || [])
      })
      .catch(() => setError('Could not load trending.'))
      .finally(() => setLoading(false))
  }, [tab])

  return (
    <div className='hk-dots' style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <Header />
      <style>{`
        .hk-tabs { display: flex; gap: 10px; margin: 18px 0 16px; }
        .hk-tab { flex: 1; padding: 10px; font-size: 1.3rem; letter-spacing: .04em; border: 2px solid var(--ink); border-radius: 10px; background: var(--surface); color: var(--ink); cursor: pointer; }
        .hk-tab.on { background: var(--c1); color: var(--on-c1); box-shadow: var(--shadow-hard); }
        [data-theme='night'] .hk-tab { background: transparent; border-color: var(--border); color: var(--muted); }
        [data-theme='night'] .hk-tab.on { border-color: var(--c1); color: var(--c1); box-shadow: 0 0 12px var(--c1), inset 0 0 8px var(--c1); }
        .hk-trend-card { display: block; padding: 14px 16px; margin-bottom: 12px; text-decoration: none; color: var(--text); }
        .hk-trend-chip { display: inline-block; font-size: .72rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; color: #111; margin-right: 8px; }
        [data-theme='night'] .hk-trend-chip { background: transparent !important; color: var(--chip) !important; border: 1.5px solid var(--chip); }
        .hk-trend-meta { font-size: .78rem; color: var(--faint); }
        .hk-trend-title { font-weight: 700; font-size: 1.05rem; margin: 8px 0 4px; color: var(--ink); }
        .hk-trend-body { font-size: .9rem; color: var(--muted); margin: 0 0 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .hk-trend-stats { display: flex; gap: 16px; font-size: .82rem; font-weight: 700; color: var(--muted); }
        .hk-trend-stats span { display: flex; align-items: center; gap: 4px; }
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

        {loading && <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Loading...</p>}
        {!loading && error && <p style={{ textAlign: 'center', color: 'var(--c1)' }}>{error}</p>}

        {!loading && !error && tab === 'videos' && <VideoFeed posts={posts} />}

        {!loading && !error && tab === 'posts' && (
          posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px 0' }}>
              Nothing trending yet. Start a conversation in any community.
            </p>
          ) : (
            posts.map((p) => {
              const color = COLORS[p.community_id] || 'var(--c2)'
              return (
                <Link key={p.id} href={'/c/' + p.community_id + '/post/' + p.id} className='hk-card hk-trend-card'>
                  <div>
                    <span className='hk-trend-chip' style={{ background: color, ['--chip' as string]: color } as React.CSSProperties}>
                      {p.community_id}
                    </span>
                    <span className='hk-trend-meta'>by {p.author_username} · {timeAgo(p.created_at)}</span>
                  </div>
                  <p className='hk-trend-title'>{p.title}</p>
                  {p.body && <p className='hk-trend-body'>{p.body}</p>}
                  <div className='hk-trend-stats'>
                    <span><ArrowFatUp size={16} weight='bold' /> {p.upvotes || 0}</span>
                    <span><ChatCircle size={16} weight='bold' /> {p.comment_count}</span>
                  </div>
                </Link>
              )
            })
          )
        )}
      </main>
    </div>
  )
}