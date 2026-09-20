'use client'
import Link from 'next/link'
import { useState, useEffect, use } from 'react'

const seededCommunities: Record<string, { name: string; description: string; accent: string; letter: string }> = {
  'money-moves': { name: 'Money Moves', description: 'Personal finance, saving, passive income', accent: '#8B5CF6', letter: 'M' },
  'builders': { name: 'Builders', description: 'Startups, side hustles, indie building', accent: '#06B6D4', letter: 'B' },
  'market-moves': { name: 'Market Moves', description: 'Stocks, crypto, options, macro', accent: '#8B5CF6', letter: 'M' },
  'the-grind': { name: 'The Grind', description: 'Career, negotiating, getting ahead', accent: '#06B6D4', letter: 'G' },
  'from-nothing': { name: 'From Nothing', description: 'Rags to riches, motivation, mindset', accent: '#8B5CF6', letter: 'F' },
}

export default function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [community, setCommunity] = useState<any>(seededCommunities[slug] || null)
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
      if (!seededCommunities[slug]) {
        try {
          const res = await fetch('/api/communities/' + slug)
          const data = await res.json()
          if (data.community) {
            setCommunity({
              name: data.community.name,
              description: data.community.description,
              accent: '#8B5CF6',
              letter: data.community.icon_emoji || data.community.name.charAt(0).toUpperCase()
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
        setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: data.upvotes } : p))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const sortedPosts = [...posts].sort((a, b) => {
    if (sort === 'new') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return (b.upvotes || 0) - (a.upvotes || 0)
  })

  if (notFound) return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'2rem', marginBottom:'16px'}}>Community not found</h1>
        <Link href='/communities' style={{color:'#8B5CF6'}}>Browse communities</Link>
      </div>
    </main>
  )

  if (!community) return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#64748B'}}>Loading...</p>
    </main>
  )

  return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white', paddingBottom:'80px'}}>
      <header style={{borderBottom:'1px solid #334155', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#080F14', zIndex:10}}>
        <Link href='/' style={{fontSize:'1.25rem', fontWeight:'600', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:'var(--font-sora)', textDecoration:'none'}}>
          Hektiq
        </Link>
        <nav style={{display:'flex', alignItems:'center', gap:'16px'}}>
          <Link href='/communities' style={{fontSize:'0.875rem', color:'#CBD5E1', textDecoration:'none'}}>Communities</Link>
          {username ? (
            <Link href={'/profile/' + username} style={{fontSize:'0.875rem', color:'#8B5CF6', textDecoration:'none', fontWeight:'600'}}>
              {username}
            </Link>
          ) : (
            <>
              <Link href='/auth/login' style={{fontSize:'0.875rem', color:'#CBD5E1', textDecoration:'none'}}>Login</Link>
              <Link href='/auth/signup' style={{borderRadius:'999px', padding:'8px 16px', fontSize:'0.875rem', fontWeight:'500', color:'white', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', textDecoration:'none'}}>
                Join
              </Link>
            </>
          )}
        </nav>
      </header>

      <div style={{maxWidth:'740px', margin:'0 auto', padding:'32px 16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px'}}>
          <div style={{width:'56px', height:'56px', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'1.25rem', fontFamily:'var(--font-sora)', background: community.accent + '22', border:'1px solid ' + community.accent, color: community.accent, flexShrink:0}}>
            {community.letter}
          </div>
          <div style={{flex:1}}>
            <h1 style={{fontFamily:'var(--font-sora)', fontSize:'1.5rem', fontWeight:'700', color:'white', marginBottom:'2px'}}>{community.name}</h1>
            <p style={{color:'#64748B', fontSize:'0.8rem'}}>{community.description}</p>
          </div>
          <button
            onClick={() => setJoined(!joined)}
            style={{borderRadius:'999px', padding:'8px 20px', fontSize:'0.875rem', fontWeight:'600', color:'white', background: joined ? 'transparent' : 'linear-gradient(to right, #8B5CF6, #06B6D4)', border: joined ? '1px solid #334155' : 'none', cursor:'pointer', flexShrink:0}}
          >
            {joined ? '✓ Joined' : 'Join'}
          </button>
        </div>

        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
          <div style={{display:'flex', gap:'8px'}}>
            {['hot', 'new', 'top'].map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                style={{borderRadius:'999px', padding:'6px 16px', fontSize:'0.8rem', fontWeight:'600', cursor:'pointer', border:'1px solid', borderColor: sort === s ? community.accent : '#334155', color: sort === s ? community.accent : '#64748B', background:'transparent'}}
              >
                {s === 'hot' ? '🔥 Hot' : s === 'new' ? '✨ New' : '⬆️ Top'}
              </button>
            ))}
          </div>
          <Link href={'/c/' + slug + '/new-post'} style={{borderRadius:'999px', padding:'8px 16px', fontSize:'0.8rem', fontWeight:'600', color:'white', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', textDecoration:'none'}}>
            + Post
          </Link>
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding:'48px', color:'#64748B'}}>Loading...</div>
        ) : sortedPosts.length === 0 ? (
          <div style={{background:'#0F172A', border:'1px solid #334155', borderRadius:'16px', padding:'48px', textAlign:'center'}}>
            <p style={{color:'#64748B', marginBottom:'16px'}}>No posts yet.</p>
            <Link href={'/c/' + slug + '/new-post'} style={{color:'#8B5CF6', textDecoration:'none', fontSize:'0.875rem', fontWeight:'500'}}>
              Create first post
            </Link>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {sortedPosts.map((post) => {
              const userVote = votes[post.id]
              return (
                <div key={post.id} style={{display:'flex', background:'#0F172A', border:'1px solid #334155', borderRadius:'12px', overflow:'hidden'}}>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'12px 14px', gap:'4px', background:'#0B1220', minWidth:'52px'}}>
                    <button
                      onClick={() => handleVote(post.id, 'up')}
                      style={{background:'none', border:'none', color: userVote === 'up' ? '#8B5CF6' : '#64748B', cursor:'pointer', fontSize:'1rem', padding:'2px', lineHeight:1}}
                    >▲</button>
                    <span style={{color: userVote === 'up' ? '#8B5CF6' : userVote === 'down' ? '#EF4444' : '#CBD5E1', fontSize:'0.8rem', fontWeight:'600'}}>
                      {post.upvotes || 0}
                    </span>
                    <button
                      onClick={() => handleVote(post.id, 'down')}
                      style={{background:'none', border:'none', color: userVote === 'down' ? '#EF4444' : '#64748B', cursor:'pointer', fontSize:'1rem', padding:'2px', lineHeight:1}}
                    >▼</button>
                  </div>
                  <Link href={'/c/' + slug + '/post/' + post.id} style={{flex:1, padding:'16px', textDecoration:'none', display:'block'}}>
                    <h3 style={{fontFamily:'var(--font-sora)', fontSize:'1rem', fontWeight:'700', color:'white', marginBottom:'6px', lineHeight:'1.4'}}>{post.title}</h3>
                    <p style={{color:'#64748B', fontSize:'0.8rem', lineHeight:'1.6', marginBottom:'10px'}}>{post.body.substring(0, 150)}{post.body.length > 150 ? '...' : ''}</p>
                    <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                      <span style={{color:'#475569', fontSize:'0.75rem'}}>{new Date(post.created_at).toLocaleDateString()}</span>
                      <span style={{color:'#475569', fontSize:'0.75rem'}}>💬 {post.comment_count || 0}</span>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <nav style={{position:'fixed', bottom:0, left:0, right:0, background:'#0F172A', borderTop:'1px solid #334155', display:'flex', justifyContent:'space-around', padding:'12px 0', zIndex:10}}>
        <Link href='/' style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', textDecoration:'none', color:'#64748B', fontSize:'0.65rem'}}>
          <span style={{fontSize:'1.2rem'}}>🏠</span>
          Home
        </Link>
        <Link href='/communities' style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', textDecoration:'none', color:'#8B5CF6', fontSize:'0.65rem'}}>
          <span style={{fontSize:'1.2rem'}}>🧩</span>
          Communities
        </Link>
        <Link href={'/c/' + slug + '/new-post'} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', textDecoration:'none', color:'#64748B', fontSize:'0.65rem'}}>
          <span style={{fontSize:'1.2rem'}}>✏️</span>
          Post
        </Link>
        <Link href={username ? '/profile/' + username : '/auth/login'} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', textDecoration:'none', color:'#64748B', fontSize:'0.65rem'}}>
          <span style={{fontSize:'1.2rem'}}>👤</span>
          {username || 'Profile'}
        </Link>
      </nav>
    </main>
  )
}