'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { seededCommunities } from '../../lib/communities'
import { CommunityIcon, ChevronIcon } from '../../components/Icons'

const COLOR: Record<string, string> = {
  'outdoors': '4',
  'sports': '5',
  'money-building': '3',
  'garage': '1',
  'art-makers': '2',
}

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

  return (
    <main className='hk-dots' style={{minHeight:'100vh', overflowX:'hidden', color:'var(--text)'}}>
      <style>{`
        .hk-row { display:flex; align-items:center; gap:14px; padding:14px 16px; text-decoration:none; color:var(--text); }
        .hk-row-icon { width:50px; height:50px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:2px solid var(--ink); transition: background-color .6s ease, color .6s ease, box-shadow .6s ease; }
        [data-theme='night'] .hk-row-icon { background: transparent !important; color: var(--row-glow) !important; border-color: var(--row-glow); box-shadow: 0 0 10px var(--row-glow); }
        [data-theme='night'] .hk-row-title { text-shadow: 0 0 10px var(--row-glow); color: var(--row-glow); }
      `}</style>

      <Header />

      <div style={{maxWidth:'720px', margin:'0 auto', padding:'32px 16px 40px'}}>
        <h1 className='font-display' style={{fontSize:'3.2rem', lineHeight:1, margin:'0 0 6px'}}>COMMUNITIES</h1>
        <p style={{color:'var(--muted)', margin:'0 0 28px', fontSize:'1rem'}}>Your corner of the internet, run by the people in it.</p>

        <h2 className='font-display' style={{fontSize:'1.3rem', margin:'0 0 12px'}}>MAIN COMMUNITIES</h2>
        <div style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'40px'}}>
          {seededCommunities.map(c => {
            const n = COLOR[c.slug] || '1'
            return (
              <Link key={c.slug} href={'/c/' + c.slug} className='hk-card hk-row' style={{['--row-glow' as any]: `var(--c${n})`}}>
                <div className='hk-row-icon' style={{background:`var(--c${n})`, color:`var(--on-c${n})`}}>
                  <CommunityIcon slug={c.slug} size={28} />
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <p className='font-display hk-row-title' style={{fontSize:'1.5rem', lineHeight:1, margin:'0 0 4px'}}>{c.name.toUpperCase()}</p>
                  <p style={{fontSize:'0.88rem', color:'var(--muted)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.description}</p>
                </div>
                <span style={{color:'var(--faint)', display:'flex', flexShrink:0}}><ChevronIcon size={18} /></span>
              </Link>
            )
          })}
        </div>

        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', margin:'0 0 12px', gap:'12px'}}>
          <h2 className='font-display' style={{fontSize:'1.3rem', margin:0}}>STARTED BY MEMBERS</h2>
          <Link href='/create-community' className='hk-btn' style={{padding:'6px 14px', minHeight:'38px', fontSize:'0.85rem'}}>
            + Start one
          </Link>
        </div>

        {userCommunities.length === 0 ? (
          <div className='hk-card' style={{padding:'24px 16px', textAlign:'center', color:'var(--muted)', borderStyle:'dashed'}}>
            No member communities yet. Be the first to start one.
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {userCommunities.map((c: any) => (
              <Link key={c.slug} href={'/c/' + c.slug} className='hk-card hk-row' style={{['--row-glow' as any]: 'var(--c2)'}}>
                <div className='hk-row-icon' style={{background:'var(--surface-2)', color:'var(--text)'}}>
                  <CommunityIcon slug={c.slug} size={26} />
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <p style={{fontWeight:700, fontSize:'1rem', margin:'0 0 3px'}}>{c.name}</p>
                  <p style={{fontSize:'0.85rem', color:'var(--muted)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.description}</p>
                </div>
                <span style={{color:'var(--faint)', display:'flex', flexShrink:0}}><ChevronIcon size={18} /></span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}