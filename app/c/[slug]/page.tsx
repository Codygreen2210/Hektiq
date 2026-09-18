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

  useEffect(() => {
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

  if (notFound) {
    return (
      <main style={{minHeight:'100vh', background:'#080F14', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <h1 style={{fontFamily:'var(--font-sora)', fontSize:'2rem', marginBottom:'16px'}}>Community not found</h1>
          <Link href='/communities' style={{color:'#8B5CF6'}}>Browse communities</Link>
        </div>
      </main>
    )
  }

  if (!community) {
    return (
      <main style={{minHeight:'100vh', background:'#080F14', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <p style={{color:'#64748B'}}>Loading...</p>
      </main>
    )
  }

  return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white'}}>
      <header style={{borderBottom:'1px solid #334155', padding:'16px 64px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <Link href='/' style={{fontSize:'1.25rem', fontWeight:'600', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:'var(--font-sora)', textDecoration:'none'}}>
          Hektiq
        </Link>
        <nav style={{display:'flex', alignItems:'center', gap:'24px'}}>
          <Link href='/communities' style={{fontSize:'0.875rem', color:'#CBD5E1', textDecoration:'none'}}>Communities</Link>
          <Link href='/auth/login' style={{fontSize:'0.875rem', color:'#CBD5E1', textDecoration:'none'}}>Login</Link>
          <Link href='/auth/signup' style={{borderRadius:'999px', padding:'8px 20px', fontSize:'0.875rem', fontWeight:'500', color:'white', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', textDecoration:'none'}}>
            Join Now
          </Link>
        </nav>
      </header>

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'48px 32px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'20px', marginBottom:'32px'}}>
          <div style={{width:'64px', height:'64px', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'1.5rem', fontFamily:'var(--font-sora)', background: community.accent + '22', border:'1px solid ' + community.accent, color: community.accent, flexShrink:0}}>
            {community.letter}
          </div>
          <div style={{flex:1}}>
            <h1 style={{fontFamily:'var(--font-sora)', fontSize:'2rem', fontWeight:'700', color:'white', marginBottom:'4px'}}>{community.name}</h1>
            <p style={{color:'#94A3B8', fontSize:'0.875rem'}}>{community.description}</p>
          </div>
          <button
            onClick={() => setJoined(!joined)}
            style={{borderRadius:'999px', padding:'10px 24px', fontSize:'0.875rem', fontWeight:'600', color:'white', background: joined ? 'transparent' : 'linear-gradient(to right, #8B5CF6, #06B6D4)', border: joined ? '1px solid #334155' : 'none', cursor:'pointer'}}
          >
            {joined ? 'Joined' : 'Join'}
          </button>
        </div>

        <div style={{borderTop:'1px solid #334155', paddingTop:'32px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px'}}>
            <h2 style={{fontFamily:'var(--font-sora)', fontSize:'1.25rem', fontWeight:'700'}}>Discussions</h2>
            <Link href={'/c/' + slug + '/new-post'} style={{borderRadius:'999px', padding:'8px 20px', fontSize:'0.875rem', fontWeight:'600', color:'white', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', textDecoration:'none'}}>
              + New Post
            </Link>
          </div>

          {loading ? (
            <div style={{textAlign:'center', padding:'48px', color:'#64748B'}}>Loading...</div>
          ) : posts.length === 0 ? (
            <div style={{background:'#0F172A', border:'1px solid #334155', borderRadius:'16px', padding:'48px', textAlign:'center'}}>
              <p style={{color:'#64748B', fontSize:'1rem', marginBottom:'16px'}}>No posts yet. Be the first to start a discussion.</p>
              <Link href={'/c/' + slug + '/new-post'} style={{color:'#8B5CF6', textDecoration:'none', fontSize:'0.875rem', fontWeight:'500'}}>
                Create first post
              </Link>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              {posts.map((post) => (
                <Link key={post.id} href={'/c/' + slug + '/post/' + post.id} style={{display:'block', background:'#0F172A', border:'1px solid #334155', borderRadius:'16px', padding:'24px', textDecoration:'none'}}>
                  <h3 style={{fontFamily:'var(--font-sora)', fontSize:'1.125rem', fontWeight:'700', color:'white', marginBottom:'8px'}}>{post.title}</h3>
                  <p style={{color:'#94A3B8', fontSize:'0.875rem', lineHeight:'1.6', marginBottom:'16px'}}>{post.body.substring(0, 200)}{post.body.length > 200 ? '...' : ''}</p>
                  <p style={{color:'#475569', fontSize:'0.75rem'}}>{new Date(post.created_at).toLocaleDateString()}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer style={{borderTop:'1px solid #334155', padding:'24px', textAlign:'center', fontSize:'0.875rem', color:'#64748B', marginTop:'48px'}}>
        Hektiq 2026 — For everyone building from nothing
      </footer>
    </main>
  )
}