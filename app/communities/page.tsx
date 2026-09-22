'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { seededCommunities } from '../../lib/communities'
import { CommunityIcon, ChevronIcon } from '../../components/Icons'

export default function Communities() {
  const [userCommunities, setUserCommunities] = useState<any[]>([])

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await fetch('/api/communities')
        const data = await res.json()
        if (data.communities) {
          setUserCommunities(data.communities.filter(
            (c: any) => !seededCommunities.find(s => s.slug === c.slug)
          ))
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchCommunities()
  }, [])

  const created = userCommunities.map((c: any) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    accent: '#8B5CF6'
  }))

  function Row({ c }: { c: { slug: string; name: string; description: string; accent: string } }) {
    return (
      <Link
        href={'/c/' + c.slug}
        style={{display:'flex', alignItems:'center', gap:'14px', background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'14px 16px', textDecoration:'none', transition:'border-color 0.15s ease, background 0.15s ease'}}
        onMouseEnter={e => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.background = '#111A2E' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E293B'; e.currentTarget.style.background = '#0F172A' }}
      >
        <div style={{width:'48px', height:'48px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', background: c.accent + '1A', color: c.accent, flexShrink:0}}>
          <CommunityIcon slug={c.slug} size={26} />
        </div>
        <div style={{flex:1, minWidth:0}}>
          <p style={{fontFamily:'var(--font-sora)', fontWeight:'700', fontSize:'1rem', color:'#F8FAFC', margin:'0 0 3px'}}>{c.name}</p>
          <p style={{fontSize:'0.85rem', color:'#94A3B8', margin:0, lineHeight:'1.4', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.description}</p>
        </div>
        <span style={{color:'#475569', display:'flex', flexShrink:0}}>
          <ChevronIcon size={18} />
        </span>
      </Link>
    )
  }

  return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white', overflowX:'hidden'}}>
      <Header />

      <div style={{maxWidth:'720px', margin:'0 auto', padding:'32px 16px 96px'}}>
        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'2rem', fontWeight:'700', color:'white', margin:'0 0 6px'}}>Communities</h1>
        <p style={{color:'#94A3B8', margin:'0 0 28px', fontSize:'0.95rem'}}>Real people. No bots. Find your corner.</p>

        <p style={{fontSize:'0.75rem', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 12px'}}>Main communities</p>
        <div style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'36px'}}>
          {seededCommunities.map(c => <Row key={c.slug} c={c} />)}
        </div>

        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', margin:'0 0 12px', gap:'12px'}}>
          <p style={{fontSize:'0.75rem', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', margin:0}}>Started by members</p>
          <Link href='/create-community' style={{fontSize:'0.85rem', fontWeight:'600', color:'#A78BFA', textDecoration:'none'}}>
            + Start one
          </Link>
        </div>
        {created.length === 0 ? (
          <div style={{border:'1px dashed #334155', borderRadius:'14px', padding:'24px 16px', textAlign:'center', color:'#64748B', fontSize:'0.9rem'}}>
            No member communities yet. Be the first to start one.
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {created.map(c => <Row key={c.slug} c={c} />)}
          </div>
        )}
      </div>

      <footer style={{borderTop:'1px solid #1E293B', padding:'24px 16px', textAlign:'center', fontSize:'0.85rem', color:'#64748B'}}>
        Hektiq 2026 — For everyone building from nothing
      </footer>
    </main>
  )
}