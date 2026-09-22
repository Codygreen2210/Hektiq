'use client'
import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import Header from '../../../components/Header'
import { seededBySlug } from '../../../lib/communities'
import { HomeIcon, CommunitiesIcon, PostIcon, ProfileIcon, HotIcon, NewIcon, TopIcon, CommentIcon, UpIcon, DownIcon, CommunityIcon } from '../../../components/Icons'

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
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [sort, setSort] = useState('hot')
  const [username, setUsername] = useState<string | null>(null)
  const [votes, setVotes] = useState<Record<string, 'up' | 'down' | null>>({})

  useEffect(() => {
    const u = localStorage.getItem('hektiq_username')
    if (u) setUsername(u)

    const savedVotes = localStorage.getItem('hektiq_votes_' + slug)
    if (savedVotes) setVotes(JSON.parse(savedVotes))

    async function fetchData() {
      if (!seededBySlug[slug]) {
        try {
          const res = await fetch('/api/communities/' + slug)
          const data = await res.json()
          if (data.community) {
            setCommunity({
              name: data.community.name,
              description: data.community.description,
              accent: '#8B5CF6'
            })
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

      try {
        const res = await fetch('/api/posts?community=' + slug)
        const data = await res.json()
        if (data.posts) setPosts(data.posts)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    fetchData()
  }, [slug])

  async function handleVote(postId: string, direction: 'up' | 'down') {
    const currentVote = votes[postId]
    if (currentVote === direction) return

    const newVotes = { ...votes, [postId]: direction }
    setVotes(newVotes)
    localStorage.setItem('hektiq_votes_' + slug, JSON.stringify(newVotes))

    try {
      const res = await fetch('/api/posts/' + postId + '/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, previousVote: currentVote })
      })
      const data = await res.json()
      if (data.upvotes !== undefined) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: data.upvotes } : p))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const sortedPosts = [...posts].sort((a, b) => {
    if (sort === 'new') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return (b.upvotes || 0) - (a.upvotes || 0)
  })

  const sorts = [
    { key: 'hot', label: 'Hot', Icon: HotIcon },
    { key: 'new', label: 'New', Icon: NewIcon },
    { key: 'top', label: 'Top', Icon: TopIcon },
  ]

  const navLink = { display:'flex', flexDirection:'column' as const, alignItems:'center', gap:'4px', textDecoration:'none', fontSize:'0.7rem', minWidth:'64px', padding:'4px 0' }

  if (notFound) return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white'}}>
      <Header />
      <div style={{textAlign:'center', padding:'64px 16px'}}>
        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'1.6rem', marginBottom:'16px'}}>Community not found</h1>
        <Link href='/communities' style={{color:'#8B5CF6'}}>Browse communities</Link>
      </div>
    </main>
  )

  if (!community) return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white'}}>
      <Header />
      <p style={{color:'#64748B', textAlign:'center', padding:'64px 16px'}}>Loading...</p>
    </main>
  )

  return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white', paddingBottom:'88px', overflowX:'hidden'}}>
      <Header />

      <div style={{maxWidth:'740px', margin:'0 auto', padding:'24px 16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'14px', marginBottom:'20px', flexWrap:'wrap'}}>
          <div style={{width:'54px', height:'54px', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', background: community.accent + '1A', color: community.accent, flexShrink:0}}>
            <CommunityIcon slug={slug} size={30} />
          </div>
          <div style={{flex:'1 1 160px', minWidth:0}}>
            <h1 style={{fontFamily:'var(--font-sora)', fontSize:'1.4rem', fontWeight:'700', color:'white', margin:'0 0 2px'}}>{community.name}</h1>
            <p style={{color:'#94A3B8', fontSize:'0.82rem', margin:0}}>{community.description}</p>
          </div>
          <button
            onClick={() => setJoined(!joined)}
            style={{borderRadius:'999px', padding:'10px 22px', minHeight:'44px', fontSize:'0.875rem', fontWeight:'600', color:'white', background: joined ? 'transparent' : 'linear-gradient(to right, #8B5CF6, #06B6D4)', border: joined ? '1px solid #334155' : 'none', cursor:'pointer', flexShrink:0}}
          >
            {joined ? 'Joined' : 'Join'}
          </button>
        </div>

        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', gap:'10px', flexWrap:'wrap'}}>
          <div style={{display:'flex', gap:'8px'}}>
            {sorts.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                style={{display:'flex', alignItems:'center', gap:'6px', borderRadius:'999px', padding:'8px 14px', minHeight:'40px', fontSize:'0.8rem', fontWeight:'600', cursor:'pointer', border:'1px solid', borderColor: sort === key ? community.accent : '#334155', color: sort === key ? community.accent : '#64748B', background:'transparent'}}
              >
                <Icon size={16} active={sort === key} />
                {label}
              </button>
            ))}
          </div>
          <Link href={'/c/' + slug + '/new-post'} style={{display:'flex', alignItems:'center', gap:'6px', borderRadius:'999px', padding:'8px 16px', minHeight:'40px', fontSize:'0.8rem', fontWeight:'600', color:'white', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', textDecoration:'none'}}>
            <PostIcon size={16} />
            Post
          </Link>
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding:'48px', color:'#64748B'}}>Loading...</div>
        ) : sortedPosts.length === 0 ? (
          <div style={{border:'1px dashed #334155', borderRadius:'16px', padding:'40px 20px', textAlign:'center'}}>
            <p style={{color:'#64748B', margin:'0 0 16px'}}>No posts yet. Start the first conversation.</p>
            <Link href={'/c/' + slug + '/new-post'} style={{color:'#8B5CF6', textDecoration:'none', fontSize:'0.875rem', fontWeight:'500'}}>
              Create first post
            </Link>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {sortedPosts.map((post) => {
              const userVote = votes[post.id]
              const name = post.author?.username
              return (
                <div key={post.id} style={{display:'flex', background:'#0F172A', border:'1px solid #1E293B', borderRadius:'12px', overflow:'hidden'}}>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'10px 8px', gap:'2px', background:'#0B1220', minWidth:'48px'}}>
                    <button
                      onClick={() => handleVote(post.id, 'up')}
                      aria-label='Upvote'
                      style={{background:'none', border:'none', color: userVote === 'up' ? '#8B5CF6' : '#64748B', cursor:'pointer', padding:'6px', display:'flex'}}
                    ><UpIcon size={18} active={userVote === 'up'} /></button>
                    <span style={{color: userVote === 'up' ? '#8B5CF6' : userVote === 'down' ? '#EF4444' : '#CBD5E1', fontSize:'0.8rem', fontWeight:'600'}}>
                      {post.upvotes || 0}
                    </span>
                    <button
                      onClick={() => handleVote(post.id, 'down')}
                      aria-label='Downvote'
                      style={{background:'none', border:'none', color: userVote === 'down' ? '#EF4444' : '#64748B', cursor:'pointer', padding:'6px', display:'flex'}}
                    ><DownIcon size={18} active={userVote === 'down'} /></button>
                  </div>
                  <Link href={'/c/' + slug + '/post/' + post.id} style={{flex:1, minWidth:0, padding:'14px', textDecoration:'none', display:'block'}}>
                    <p style={{fontSize:'0.78rem', color:'#64748B', margin:'0 0 6px'}}>
                      {name ? <span style={{color:'#CBD5E1', fontWeight:'600'}}>{name}</span> : 'unknown'} · {timeAgo(post.created_at)}
                    </p>
                    <h3 style={{fontFamily:'var(--font-sora)', fontSize:'1rem', fontWeight:'700', color:'white', margin:'0 0 6px', lineHeight:'1.4', wordBreak:'break-word'}}>{post.title}</h3>
                    <p style={{color:'#94A3B8', fontSize:'0.85rem', lineHeight:'1.6', margin:'0 0 10px', wordBreak:'break-word'}}>{(post.body || '').substring(0, 150)}{(post.body || '').length > 150 ? '...' : ''}</p>
                    <span style={{display:'inline-flex', alignItems:'center', gap:'5px', color:'#64748B', fontSize:'0.78rem'}}>
                      <CommentIcon size={14} />
                      {post.comment_count || 0} {post.comment_count === 1 ? 'comment' : 'comments'}
                    </span>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <nav style={{position:'fixed', bottom:0, left:0, right:0, background:'#0F172A', borderTop:'1px solid #1E293B', display:'flex', justifyContent:'space-around', padding:'8px 0 12px', zIndex:10}}>
        <Link href='/' style={{...navLink, color:'#64748B'}}>
          <HomeIcon />
          Home
        </Link>
        <Link href='/communities' style={{...navLink, color:'#8B5CF6'}}>
          <CommunitiesIcon active />
          Communities
        </Link>
        <Link href={'/c/' + slug + '/new-post'} style={{...navLink, color:'#64748B'}}>
          <PostIcon />
          Post
        </Link>
        <Link href={username ? '/profile/' + username : '/auth/login'} style={{...navLink, color:'#64748B'}}>
          <ProfileIcon />
          {username || 'Profile'}
        </Link>
      </nav>
    </main>
  )
}