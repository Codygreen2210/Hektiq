'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Header from '../../components/Header'

const seededCommunities = [
  { slug: 'money-moves', letter: 'M', accent: '#8B5CF6', name: 'Money Moves', description: 'Personal finance, saving, passive income' },
  { slug: 'builders', letter: 'B', accent: '#06B6D4', name: 'Builders', description: 'Startups, side hustles, indie building' },
  { slug: 'market-moves', letter: 'M', accent: '#8B5CF6', name: 'Market Moves', description: 'Stocks, crypto, options, macro' },
  { slug: 'the-grind', letter: 'G', accent: '#06B6D4', name: 'The Grind', description: 'Career, negotiating, getting ahead' },
  { slug: 'from-nothing', letter: 'F', accent: '#8B5CF6', name: 'From Nothing', description: 'Rags to riches, motivation, mindset' },
]

export default function Communities() {
  const [userCommunities, setUserCommunities] = useState<any[]>([])

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await fetch('/api/communities')
        const data = await res.json()
        if (data.communities) {
          const filtered = data.communities.filter(
            (c: any) => !seededCommunities.find(s => s.slug === c.slug)
          )
          setUserCommunities(filtered)
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchCommunities()
  }, [])

  const allCommunities = [
    ...seededCommunities,
    ...userCommunities.map((c: any) => ({
      slug: c.slug,
      letter: c.icon_emoji || c.name.charAt(0).toUpperCase(),
      accent: '#8B5CF6',
      name: c.name,
      description: c.description
    }))
  ]

  return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white'}}>
      <Header />

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'48px 32px 96px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
          <h1 style={{fontFamily:'var(--font-sora)', fontSize:'2.5rem', fontWeight:'700', color:'white'}}>Communities</h1>
          <Link href='/create-community' style={{borderRadius:'999px', padding:'8px 20px', fontSize:'0.875rem', fontWeight:'600', color:'white', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', textDecoration:'none'}}>
            + Create Community
          </Link>
        </div>
        <p style={{color:'#94A3B8', marginBottom:'40px'}}>For everyone building from nothing.</p>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'24px'}}>
          {allCommunities.map((c) => (
            <Link
              key={c.slug}
              href={'/c/' + c.slug}
              style={{display:'block', background:'#0F172A', border:'1px solid #334155', borderRadius:'16px', padding:'24px', textDecoration:'none', transition:'all 0.2s ease'}}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.transform = 'translateY(-4px)'
                el.style.background = '#131C31'
                el.style.borderColor = c.accent
                el.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.35), 0 12px 32px rgba(139,92,246,0.12)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.transform = 'translateY(0)'
                el.style.background = '#0F172A'
                el.style.borderColor = '#334155'
                el.style.boxShadow = 'none'
              }}
            >
              <div style={{width:'48px', height:'48px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'600', fontSize:'1rem', marginBottom:'16px', fontFamily:'var(--font-sora)', background: c.accent + '22', border:'1px solid ' + c.accent, color: c.accent}}>
                {c.letter}
              </div>
              <h3 style={{fontFamily:'var(--font-sora)', fontWeight:'700', fontSize:'1.125rem', color:'white', marginBottom:'6px'}}>
                {c.name}
              </h3>
              <p style={{fontSize:'0.875rem', color:'#94A3B8', marginBottom:'24px'}}>
                {c.description}
              </p>
              <p style={{fontSize:'0.75rem', color:'#64748B'}}>
                0 members
              </p>
            </Link>
          ))}
        </div>
      </div>

      <footer style={{borderTop:'1px solid #334155', padding:'24px', textAlign:'center', fontSize:'0.875rem', color:'#64748B'}}>
        Hektiq 2026 — For everyone building from nothing
      </footer>
    </main>
  )
}