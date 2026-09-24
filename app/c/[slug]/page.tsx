'use client'
import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import Header from '../../../components/Header'
import VideoPreview from '../../../components/VideoPreview'
import { seededBySlug } from '../../../lib/communities'
import { getAuthHeader } from '../../../lib/authToken'
import { HomeIcon, CommunitiesIcon, PostIcon, ProfileIcon, CommentIcon, UpIcon, DownIcon, CommunityIcon } from '../../../components/Icons'
import { PixelFlame, PixelSparkle, PixelTrophy } from '../../../components/PixelIcons'
import { TrendUp } from '@phosphor-icons/react'

const COLOR: Record<string, string> = {
  'outdoors': '4',
  'sports': '5',
  'money-building': '3',
  'garage': '1',
  'art-makers': '2',
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}

export default function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [community, setCommunity] = useState<any>(seededBySlug[slug] || null)
  const [joined, setJoined] = useState(false)
  const [members, setMembers] = useState<number | null>(null)
  const [joining, setJoining] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [sort, setSort] = useState('hot')
  const [username, setUsername] = useState<string | null>(null)
  const [votes, setVotes] = useState<Record<string, 'up' | 'down' | null>>({})
  const [voteMsg, setVoteMsg] = useState('')
  const [popId, setPopId] = useState<string | null>(null)

  const n = COLOR[slug] || '2'
  const accent = `var(--c${n})`

  useEffect(() => {
    const u = localStorage.getItem('hektiq_username')
    if (u) setUsername(u)

    async function fetchData() {
      if (!seededBySlug[slug]) {
        try {
          const res = await fetch('/api/communities/' + slug)
          const data = await res.json()
          if (data.community) {
            setCommunity({ name: data.community.name, description: data.community.description })
          } else {
            setNotFound(true)
            setLoading(false)
            return
          }
        } catch (e) {
          setNotFound(true)
          setLoading(false)
          return
        }
      }

      // Join status and member count
      try {
        const auth = u ? await getAuthHeader() : {}
        const fr = await fetch('/api/communities/' + slug + '/follow', { headers: { ...auth }, cache: 'no-store' })
        const fd = await fr.json()
        if (!fd.error) {
          setJoined(!!fd.joined)
          setMembers(fd.members ?? 0)
        }
      } catch (e) {}

      try {
        const res = await fetch('/api/posts?community=' + slug)
        const data = await res.json()
        const list = data.posts || []
        setPosts(list)

        if (u && list.length > 0) {
          const auth = await getAuthHeader()
          const vr = await fetch('/api/posts/my-votes?ids=' + list.map((p: any) => p.id).join(','), { headers: { ...auth } })
          const vd = await vr.json()
          setVotes(vd.votes || {})
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    fetchData()
  }, [slug])

  function flash(msg: string, ms = 3500) {
    setVoteMsg(msg)
    setTimeout(() => setVoteMsg(''), ms)
  }

  async function handleJoin() {
    if (!username) return flash('Log in to join.', 2500)
    if (joining) return
    setJoining(true)

    const prevJoined = joined
    const prevMembers = members
    setJoined(!prevJoined)
    setMembers(m => (m ?? 0) + (prevJoined ? -1 : 1))

    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/communities/' + slug + '/follow', { method: 'POST', headers: { ...auth } })
      const data = await res.json()
      if (data.error) {
        setJoined(prevJoined)
        setMembers(prevMembers)
        flash(data.error)
      } else {
        setJoined(!!data.joined)
        setMembers(data.members ?? 0)
      }
    } catch (e) {
      setJoined(prevJoined)
      setMembers(prevMembers)
      flash('Something went wrong. Try again.')
    }
    setJoining(false)
  }

  async function handleVote(postId: string, direction: 'up' | 'down') {
    if (!username) return flash('Log in to vote.', 2500)

    setPopId(postId + direction)
    setTimeout(() => setPopId(null), 300)

    const prevVote = votes[postId] || null
    const prevPosts = posts
    const nextVote = prevVote === direction ? null : direction
    const delta = (nextVote === 'up' ? 1 : nextVote === 'down' ? -1 : 0) - (prevVote === 'up' ? 1 : prevVote === 'down' ? -1 : 0)

    setVotes(v => ({ ...v, [postId]: nextVote }))
    setPosts(ps => ps.map(p => p.id === postId ? { ...p, upvotes: (p.upvotes || 0) + delta } : p))

    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/posts/' + postId + '/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ direction })
      })
      const data = await res.json()
      if (data.error) {
        setVotes(v => ({ ...v, [postId]: prevVote }))
        setPosts(prevPosts)
        flash(data.error)
      } else {
        setVotes(v => ({ ...v, [postId]: data.myVote }))
        setPosts(ps => ps.map(p => p.id === postId ? { ...p, upvotes: data.upvotes } : p))
      }
    } catch (e) {
      setVotes(v => ({ ...v, [postId]: prevVote }))
      setPosts(prevPosts)
    }
  }

  const sortedPosts = [...posts].sort((a, b) => {
    if (sort === 'new') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return (b.upvotes || 0) - (a.upvotes || 0)
  })

  const sorts = [
    { key: 'hot', label: 'HOT', Icon: PixelFlame, day: '1' },
    { key: 'new', label: 'NEW', Icon: PixelSparkle, day: '5' },
    { key: 'top', label: 'TOP', Icon: PixelTrophy, day: '3' },
  ]

  const navLink = { display:'flex', flexDirection:'column' as const, alignItems:'center', gap:'4px', textDecoration:'none', fontSize:'0.72rem', fontWeight:600, minWidth:'64px', padding:'4px 0' }

  if (notFound) return (
    <main style={{minHeight:'100vh', color:'var(--text)'}}>
      <Header />
      <div style={{textAlign:'center', padding:'64px 16px'}}>
        <h1 className='font-display' style={{fontSize:'2.4rem', marginBottom:'16px'}}>COMMUNITY NOT FOUND</h1>
        <Link href='/communities' className='hk-btn'>Browse communities</Link>
      </div>
    </main>
  )

  if (!community) return (
    <main style={{minHeight:'100vh', color:'var(--text)'}}>
      <Header />
      <p style={{color:'var(--muted)', textAlign:'center', padding:'64px 16px'}}>Loading...</p>
    </main>
  )

  const loginLink = voteMsg === 'Log in to vote.' || voteMsg === 'Log in to join.'

  return (
    <main className='hk-dots' style={{minHeight:'100vh', color:'var(--text)', paddingBottom:'96px', overflowX:'hidden', ['--tube' as any]: accent}}>
      <style>{`
        .hk-banner { border-bottom: 2px solid var(--ink); transition: background-color .6s ease; }
        [data-theme='night'] .hk-banner { background: transparent !important; border-color: var(--banner-glow); box-shadow: 0 6px 18px -8px var(--banner-glow); }
        [data-theme='night'] .hk-banner-title, [data-theme='night'] .hk-banner-icon { color: var(--banner-glow) !important; text-shadow: 0 0 12px var(--banner-glow); }
        [data-theme='night'] .hk-banner-icon { border-color: var(--banner-glow) !important; box-shadow: 0 0 10px var(--banner-glow); background: transparent !important; }
        [data-theme='night'] .hk-banner-desc { color: var(--muted) !important; }

        .hk-tab {
          display:flex; align-items:center; gap:8px;
          border-radius:6px; padding:7px 14px 6px; min-height:42px;
          font-family: var(--font-bebas), 'Arial Narrow', sans-serif; font-size:1.2rem; letter-spacing:.06em; line-height:1;
          cursor:pointer; border:2px solid var(--border-soft); color:var(--muted); background:var(--surface);
          transition: background-color .25s ease, color .25s ease, border-color .25s ease, box-shadow .25s ease, transform .12s ease;
        }
        .hk-tab:hover { border-color: var(--border); color: var(--text); }
        .hk-tab.active { background: var(--tab-day); color: var(--tab-on); border-color: var(--ink); box-shadow: var(--shadow-hard); }
        .hk-tab.active:active { transform: translate(2px,2px); box-shadow: none; }

        [data-theme='night'] .hk-tab { background: rgba(22,12,38,.6); border-color: #2E1F47; color: #7D6A9C; }
        [data-theme='night'] .hk-tab:hover { color: #F6E9FF; border-color: #4A3470; }
        [data-theme='night'] .hk-tab.active {
          color: #FFFFFF;
          text-shadow: 0 0 8px var(--tube);
          border: 2px solid var(--tube);
          background-color: rgba(255,255,255,.04);
          background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0px, rgba(255,255,255,.07) 1px, transparent 1px, transparent 3px);
          box-shadow: inset 0 0 0 2px rgba(255,255,255,.55), 0 0 10px var(--tube), inset 0 0 12px var(--tube);
          animation: hk-tube 3.2s ease-in-out infinite;
        }
        @keyframes hk-tube {
          0%, 100% { box-shadow: inset 0 0 0 2px rgba(255,255,255,.55), 0 0 10px var(--tube), inset 0 0 12px var(--tube); }
          50% { box-shadow: inset 0 0 0 2px rgba(255,255,255,.7), 0 0 20px var(--tube), 0 0 32px var(--tube), inset 0 0 16px var(--tube); }
        }

        .hk-vote { background:none; border:none; cursor:pointer; padding:6px; display:flex; color:var(--faint); }
        .hk-vote.up.on { color: var(--c4); }
        .hk-vote.down.on { color: var(--c1); }
        [data-theme='night'] .hk-vote.on { filter: drop-shadow(0 0 6px currentColor); }

        .hk-card-thumb { position: relative; flex-shrink: 0; width: 84px; height: 84px; border-radius: 8px; overflow: hidden; border: 2px solid var(--border-soft); align-self: center; }
        .hk-card-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hk-card-more { position: absolute; right: 4px; bottom: 4px; background: rgba(0,0,0,.72); color: #fff; font-size: .7rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; }

        .hk-bottom-nav { position:fixed; bottom:0; left:0; right:0; background:var(--bg); border-top:2px solid var(--border-soft); display:flex; justify-content:space-around; padding:8px 0 12px; z-index:10; transition: background-color .6s ease; }
        [data-theme='night'] .hk-bottom-nav { border-top-color: var(--tube); box-shadow: 0 -4px 16px -8px var(--tube); }
      `}</style>

      <Header />

      <div className='hk-banner' style={{background: accent, ['--banner-glow' as any]: accent}}>
        <div style={{maxWidth:'740px', margin:'0 auto', padding:'24px 16px', display:'flex', alignItems:'center', gap:'14px', flexWrap:'wrap'}}>
          <div className='hk-banner-icon' style={{width:'60px', height:'60px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', color: accent, border:'2px solid var(--ink)', flexShrink:0}}>
            <CommunityIcon slug={slug} size={34} />
          </div>
          <div style={{flex:'1 1 160px', minWidth:0}}>
            <h1 className='font-display hk-banner-title' style={{fontSize:'2.4rem', lineHeight:1, margin:'0 0 4px', color:`var(--on-c${n})`}}>{community.name.toUpperCase()}</h1>
            <p className='hk-banner-desc' style={{fontSize:'0.92rem', margin:0, color:`var(--on-c${n})`}}>{community.description}</p>
            {members !== null && (
              <p className='hk-banner-desc' style={{fontSize:'0.82rem', fontWeight:700, margin:'6px 0 0', color:`var(--on-c${n})`}}>
                {members} {members === 1 ? 'member' : 'members'}
              </p>
            )}
          </div>
          <button onClick={handleJoin} disabled={joining} className={joined ? 'hk-btn-ghost' : 'hk-btn'} style={{flexShrink:0, background: joined ? 'var(--bg)' : undefined}}>
            {joined ? 'Joined' : 'Join'}
          </button>
        </div>
      </div>

      <div style={{maxWidth:'740px', margin:'0 auto', padding:'20px 16px'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', gap:'10px', flexWrap:'wrap'}}>
          <div style={{display:'flex', gap:'8px'}} role='tablist' aria-label='Sort posts'>
            {sorts.map(({ key, label, Icon, day }) => (
              <button
                key={key}
                role='tab'
                aria-selected={sort === key}
                onClick={() => setSort(key)}
                className={'hk-tab' + (sort === key ? ' active' : '')}
                style={{['--tab-day' as any]: `var(--c${day})`, ['--tab-on' as any]: `var(--on-c${day})`}}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
          <Link href={'/c/' + slug + '/new-post'} className='hk-btn' style={{padding:'8px 16px', minHeight:'42px', fontSize:'0.88rem'}}>
            <PostIcon size={16} />
            Post
          </Link>
        </div>

        {voteMsg && (
          <div className='hk-card' style={{padding:'10px 14px', fontSize:'0.9rem', marginBottom:'12px', borderColor:'var(--border)'}}>
            {voteMsg}{loginLink && <> <Link href='/auth/login' style={{color:'var(--c5)', fontWeight:700}}>Log in</Link></>}
          </div>
        )}

        {loading ? (
          <div style={{textAlign:'center', padding:'48px', color:'var(--muted)'}}>Loading...</div>
        ) : sortedPosts.length === 0 ? (
          <div className='hk-card' style={{padding:'40px 20px', textAlign:'center', borderStyle:'dashed'}}>
            <p style={{color:'var(--muted)', margin:'0 0 16px'}}>No posts yet. Start the first conversation.</p>
            <Link href={'/c/' + slug + '/new-post'} className='hk-btn'>Create first post</Link>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {sortedPosts.map((post) => {
              const userVote = votes[post.id]
              const name = post.author?.username
              const photos: string[] = Array.isArray(post.image_urls) ? post.image_urls : []
              return (
                <div key={post.id} className='hk-card' style={{display:'flex', overflow:'hidden'}}>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'10px 6px', gap:'2px', background:'var(--surface-2)', minWidth:'50px', borderRight:'2px solid var(--border-soft)'}}>
                    <button
                      onClick={() => handleVote(post.id, 'up')}
                      aria-label='Upvote'
                      className={'hk-vote up' + (userVote === 'up' ? ' on' : '') + (popId === post.id + 'up' ? ' hk-pop' : '')}
                    ><UpIcon size={20} active={userVote === 'up'} /></button>
                    <span style={{fontSize:'0.9rem', fontWeight:800, color: userVote === 'up' ? 'var(--c4)' : userVote === 'down' ? 'var(--c1)' : 'var(--text)'}}>
                      {post.upvotes || 0}
                    </span>
                    <button
                      onClick={() => handleVote(post.id, 'down')}
                      aria-label='Downvote'
                      className={'hk-vote down' + (userVote === 'down' ? ' on' : '') + (popId === post.id + 'down' ? ' hk-pop' : '')}
                    ><DownIcon size={20} active={userVote === 'down'} /></button>
                  </div>
                  <Link href={'/c/' + slug + '/post/' + post.id} style={{flex:1, minWidth:0, padding:'14px', textDecoration:'none', display:'flex', gap:'12px', color:'var(--text)'}}>
                    <div style={{flex:1, minWidth:0}}>
                      <p style={{fontSize:'0.8rem', color:'var(--muted)', margin:'0 0 6px'}}>
                        {name ? <span style={{color:'var(--text)', fontWeight:700}}>{name}</span> : 'unknown'} · {timeAgo(post.created_at)}
                      </p>
                      <h3 style={{fontSize:'1.05rem', fontWeight:700, margin:'0 0 8px', lineHeight:'1.4', wordBreak:'break-word'}}>{post.title}</h3>
                      {post.video_url && <VideoPreview url={post.video_url} />}
                      {post.body && (
                        <p style={{color:'var(--muted)', fontSize:'0.9rem', lineHeight:'1.6', margin:'0 0 10px', wordBreak:'break-word'}}>{post.body.substring(0, 150)}{post.body.length > 150 ? '...' : ''}</p>
                      )}
                      <span style={{display:'inline-flex', alignItems:'center', gap:'5px', color:'var(--faint)', fontSize:'0.82rem', fontWeight:600}}>
                        <CommentIcon size={15} />
                        {post.comment_count || 0} {post.comment_count === 1 ? 'comment' : 'comments'}
                      </span>
                    </div>
                    {photos.length > 0 && (
                      <div className='hk-card-thumb'>
                        <img src={photos[0]} alt='' loading='lazy' />
                        {photos.length > 1 && <span className='hk-card-more'>+{photos.length - 1}</span>}
                      </div>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <nav className='hk-bottom-nav'>
        <Link href='/' style={{...navLink, color:'var(--faint)'}}>
          <HomeIcon />
          Home
        </Link>
        <Link href='/trending' style={{...navLink, color:'var(--faint)'}}>
          <TrendUp size={24} weight='duotone' />
          Trending
        </Link>
        <Link href='/communities' style={{...navLink, color: accent}}>
          <CommunitiesIcon active />
          Communities
        </Link>
        <Link href={'/c/' + slug + '/new-post'} style={{...navLink, color:'var(--faint)'}}>
          <PostIcon />
          Post
        </Link>
        <Link href={username ? '/profile/' + username : '/auth/login'} style={{...navLink, color:'var(--faint)'}}>
          <ProfileIcon />
          {username || 'Profile'}
        </Link>
      </nav>
    </main>
  )
}