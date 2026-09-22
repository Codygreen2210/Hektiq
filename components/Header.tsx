'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'

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
    <header style={{borderBottom:'1px solid #1E293B', background:'rgba(8,15,20,0.92)', backdropFilter:'blur(8px)', position:'sticky', top:0, zIndex:20}}>
      <style>{`
        .hk-desktop { display: flex; }
        .hk-mobile { display: none; }
        @media (max-width: 720px) {
          .hk-desktop { display: none; }
          .hk-mobile { display: flex; }
        }
      `}</style>

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'12px 16px', display:'flex', alignItems:'center', gap:'16px'}}>
        <Link href='/' style={{fontSize:'1.35rem', fontWeight:'700', fontFamily:'var(--font-sora)', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', textDecoration:'none', flexShrink:0}}>
          Hektiq
        </Link>

        <div className='hk-desktop' style={{flex:1, justifyContent:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', width:'100%', maxWidth:'460px', background:'#0F172A', border:'1px solid #1E293B', borderRadius:'999px', padding:'0 16px', height:'42px', color:'#64748B'}}>
            <MagnifyingGlass size={18} weight='bold' aria-hidden='true' />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder='Search Hektiq'
              aria-label='Search Hektiq'
              style={{flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:'0.9rem'}}
            />
          </div>
        </div>

        <div style={{flex:1}} className='hk-mobile' />

        <nav style={{display:'flex', alignItems:'center', gap:'12px', flexShrink:0}}>
          <Link href='/communities' className='hk-desktop' style={{color:'#94A3B8', textDecoration:'none', fontSize:'0.875rem', padding:'8px 4px'}}>
            Communities
          </Link>

          <Link href='/search' className='hk-mobile' aria-label='Search' style={{color:'#94A3B8', width:'40px', height:'40px', alignItems:'center', justifyContent:'center', borderRadius:'50%'}}>
            <MagnifyingGlass size={22} weight='bold' />
          </Link>

          {username ? (
            <>
              <Link href={'/profile/' + username} style={{display:'flex', alignItems:'center', gap:'8px', textDecoration:'none'}}>
                {avatar ? (
                  <img src={avatar} alt={username} style={{width:'34px', height:'34px', borderRadius:'50%', objectFit:'cover', border:'1px solid #334155'}} />
                ) : (
                  <div style={{width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg, #8B5CF6, #06B6D4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:'700', color:'white'}}>
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className='hk-desktop' style={{color:'#E2E8F0', fontSize:'0.875rem', fontWeight:'600'}}>{username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className='hk-desktop'
                style={{background:'transparent', border:'1px solid #334155', color:'#94A3B8', borderRadius:'999px', padding:'7px 16px', fontSize:'0.85rem', cursor:'pointer'}}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href='/auth/login' className='hk-desktop' style={{color:'#94A3B8', textDecoration:'none', fontSize:'0.875rem', padding:'8px 4px'}}>Login</Link>
              <Link href='/auth/signup' style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', color:'white', borderRadius:'999px', padding:'9px 18px', fontWeight:'600', textDecoration:'none', fontSize:'0.85rem', whiteSpace:'nowrap'}}>
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}