'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import ThemeToggle from './ThemeToggle'

function LogoMark() {
  const colors = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)']
  return (
    <div style={{width:'28px', height:'28px', borderRadius:'6px', overflow:'hidden', display:'flex', flexDirection:'column', transform:'skewX(-8deg)', border:'2px solid var(--ink)', flexShrink:0}}>
      {colors.map(c => <div key={c} style={{flex:1, background:c, transition:'background 0.6s ease'}} />)}
    </div>
  )
}

export default function Header() {
  const [username, setUsername] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const u = localStorage.getItem('hektiq_username')
    if (u) {
      setUsername(u)
      fetch('/api/profile/' + u)
        .then(r => r.json())
        .then(data => { if (data.profile?.avatar_url) setAvatar(data.profile.avatar_url) })
        .catch(console.error)
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('hektiq_username')
    localStorage.removeItem('hektiq_user_id')
    window.location.href = '/'
  }

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && query.trim()) {
      window.location.href = '/search?q=' + encodeURIComponent(query.trim())
    }
  }

  return (
    <header style={{borderBottom:'2px solid var(--border-soft)', background:'var(--bg)', position:'sticky', top:0, zIndex:20, transition:'background 0.6s ease, border-color 0.6s ease'}}>
      <style>{`
        .hk-desktop { display: flex; }
        .hk-mobile { display: none; }
        @media (max-width: 720px) {
          .hk-desktop { display: none; }
          .hk-mobile { display: flex; }
        }
      `}</style>

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'10px 16px', display:'flex', alignItems:'center', gap:'14px'}}>
        <Link href='/' style={{display:'flex', alignItems:'center', gap:'10px', textDecoration:'none', color:'var(--text)', flexShrink:0}}>
          <LogoMark />
          <span className='font-display' style={{fontSize:'1.7rem', lineHeight:1}}>HEKTIQ</span>
        </Link>

        <div className='hk-desktop' style={{flex:1, justifyContent:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', width:'100%', maxWidth:'440px', background:'var(--surface)', border:'2px solid var(--border-soft)', borderRadius:'8px', padding:'0 14px', height:'42px', color:'var(--faint)'}}>
            <MagnifyingGlass size={18} weight='bold' aria-hidden='true' />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder='Search Hektiq'
              aria-label='Search Hektiq'
              style={{flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text)', fontSize:'0.9rem'}}
            />
          </div>
        </div>

        <div style={{flex:1}} className='hk-mobile' />

        <nav style={{display:'flex', alignItems:'center', gap:'10px', flexShrink:0}}>
          <Link href='/communities' className='hk-desktop' style={{color:'var(--muted)', textDecoration:'none', fontSize:'0.9rem', fontWeight:600, padding:'8px 4px'}}>
            Communities
          </Link>

          <Link href='/search' className='hk-mobile' aria-label='Search' style={{color:'var(--muted)', width:'40px', height:'40px', alignItems:'center', justifyContent:'center'}}>
            <MagnifyingGlass size={22} weight='bold' />
          </Link>

          <ThemeToggle />

          {username ? (
            <>
              <Link href={'/profile/' + username} style={{display:'flex', alignItems:'center', gap:'8px', textDecoration:'none'}}>
                {avatar ? (
                  <img src={avatar} alt={username} style={{width:'36px', height:'36px', borderRadius:'50%', objectFit:'cover', border:'2px solid var(--border)'}} />
                ) : (
                  <div style={{width:'36px', height:'36px', borderRadius:'50%', background:'var(--c2)', color:'var(--on-c2)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', fontWeight:700}}>
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className='hk-desktop' style={{color:'var(--text)', fontSize:'0.9rem', fontWeight:600}}>{username}</span>
              </Link>
              <button onClick={handleLogout} className='hk-desktop hk-btn-ghost' style={{padding:'6px 14px', minHeight:'38px', fontSize:'0.85rem'}}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href='/auth/login' className='hk-desktop' style={{color:'var(--muted)', textDecoration:'none', fontSize:'0.9rem', fontWeight:600, padding:'8px 4px'}}>Log in</Link>
              <Link href='/auth/signup' className='hk-btn' style={{padding:'8px 16px', minHeight:'40px', fontSize:'0.9rem'}}>
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}