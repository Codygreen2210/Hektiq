'use client'
import Link from 'next/link'
import { useState, use } from 'react'

const communityData: Record<string, { name: string; description: string; accent: string; letter: string }> = {
  'money-moves': { name: 'Money Moves', description: 'Personal finance, saving, passive income', accent: '#8B5CF6', letter: 'M' },
  'builders': { name: 'Builders', description: 'Startups, side hustles, indie building', accent: '#06B6D4', letter: 'B' },
  'market-moves': { name: 'Market Moves', description: 'Stocks, crypto, options, macro', accent: '#8B5CF6', letter: 'M' },
  'the-grind': { name: 'The Grind', description: 'Career, negotiating, getting ahead', accent: '#06B6D4', letter: 'G' },
  'from-nothing': { name: 'From Nothing', description: 'Rags to riches, motivation, mindset', accent: '#8B5CF6', letter: 'F' },
}

export default function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const community = communityData[slug]
  const [joined, setJoined] = useState(false)

  if (!community) {
    return (
      <main style={{minHeight:'100vh', background:'#080F14', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <h1 style={{fontFamily:'var(--font-sora)', fontSize:'2rem', marginBottom:'16px'}}>Community not found</h1>
          <Link href='/communities' style={{color:'#8B5CF6'}}>Browse communities</Link>
        </div>
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
            <Link href='/auth/signup' style={{borderRadius:'999px', padding:'8px 20px', fontSize:'0.875rem', fontWeight:'600', color:'white', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', textDecoration:'none'}}>
              + New Post
            </Link>
          </div>

          <div style={{background:'#0F172A', border:'1px solid #334155', borderRadius:'16px', padding:'48px', textAlign:'center'}}>
            <p style={{color:'#64748B', fontSize:'1rem', marginBottom:'16px'}}>No posts yet. Be the first to start a discussion.</p>
            <Link href='/auth/signup' style={{color:'#8B5CF6', textDecoration:'none', fontSize:'0.875rem', fontWeight:'500'}}>
              Sign up to post
            </Link>
          </div>
        </div>
      </div>

      <footer style={{borderTop:'1px solid #334155', padding:'24px', textAlign:'center', fontSize:'0.875rem', color:'#64748B', marginTop:'48px'}}>
        Hektiq 2026 — For everyone building from nothing
      </footer>
    </main>
  )
}