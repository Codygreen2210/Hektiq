'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Header() {
  const [username, setUsername] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('hektiq_username')
    if (u) {
      setUsername(u)
      fetch('/api/profile/' + u)
        .then(r => r.json())
        .then(data => {
          if (data.profile?.avatar_url) setAvatar(data.profile.avatar_url)
        })
        .catch(console.error)
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('hektiq_username')
    localStorage.removeItem('hektiq_user_id')
    window.location.href = '/'
  }

  return (
    <header style={{borderBottom:'1px solid #334155', padding:'16px 48px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#080F14', position:'sticky', top:0, zIndex:10}}>
      <Link href='/' style={{fontSize:'1.25rem', fontWeight:'700', fontFamily:'var(--font-sora)', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', textDecoration:'none'}}>
        Hektiq
      </Link>
      <nav style={{display:'flex', alignItems:'center', gap:'24px'}}>
        <Link href='/communities' style={{color:'#94A3B8', textDecoration:'none', fontSize:'0.875rem'}}>
          Communities
        </Link>
        {username ? (
          <>
            <Link href={'/profile/' + username} style={{display:'flex', alignItems:'center', gap:'8px', textDecoration:'none'}}>
              {avatar ? (
                <img src={avatar} alt={username} style={{width:'28px', height:'28px', borderRadius:'50%', objectFit:'cover'}} />
              ) : (
                <div style={{width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg, #8B5CF6, #06B6D4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:'700', color:'white'}}>
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{color:'#8B5CF6', fontSize:'0.875rem', fontWeight:'600'}}>{username}</span>
            </Link>
            <button
              onClick={handleLogout}
              style={{background:'transparent', border:'1px solid #334155', color:'#94A3B8', borderRadius:'999px', padding:'6px 16px', fontSize:'0.875rem', cursor:'pointer'}}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href='/auth/login' style={{color:'#94A3B8', textDecoration:'none', fontSize:'0.875rem'}}>Login</Link>
            <Link href='/auth/signup' style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', color:'white', borderRadius:'999px', padding:'8px 20px', fontWeight:'600', textDecoration:'none', fontSize:'0.875rem'}}>
              Join Now
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}