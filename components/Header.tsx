'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { MagnifyingGlass, EnvelopeSimple } from '@phosphor-icons/react'
import ThemeToggle from './ThemeToggle'
import { getAuthHeader } from '../lib/authToken'

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
  const [unverified, setUnverified] = useState(false)
  const [resendState, setResendState] = useState<'' | 'sending' | 'sent'>('')
  const [resendMsg, setResendMsg] = useState('')
  const [query, setQuery] = useState('')

  const loadProfile = useCallback((u: string) => {
    fetch('/api/profile/' + encodeURIComponent(u), { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (!data.profile) return
        setAvatar(data.profile.avatar_url || null)
        setUnverified(data.profile.email_verified === false)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const u = localStorage.getItem('hektiq_username')
    if (!u) return
    setUsername(u)
    loadProfile(u)

    function recheck() {
      if (document.visibilityState === 'visible') loadProfile(u as string)
    }
    document.addEventListener('visibilitychange', recheck)
    window.addEventListener('focus', recheck)
    return () => {
      document.removeEventListener('visibilitychange', recheck)
      window.removeEventListener('focus', recheck)
    }
  }, [loadProfile])

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

  async function resend() {
    setResendState('sending')
    setResendMsg('')
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/auth/resend-verification', { method: 'POST', headers: { ...auth } })
      const data = await res.json()
      if (data.already) { setUnverified(false); setResendState(''); return }
      if (data.error) { setResendMsg(data.error); setResendState('') }
      else setResendState('sent')
    } catch (e) {
      setResendMsg('Couldn\'t send. Try again.')
      setResendState('')
    }
  }

  return (
    <>
      <header style={{borderBottom:'2px solid var(--border-soft)', background:'var(--bg)', position:'sticky', top:0, zIndex:20, transition:'background 0.6s ease, border-color 0.6s ease'}}>
        <style>{`
          .hk-desktop { display: flex; }
          .hk-mobile { display: none; }
          @media (max-width: 720px) {
            .hk-desktop { display: none; }
            .hk-mobile { display: flex; }
          }
          .hk-verify { background: var(--c3); color: var(--on-c3); border-bottom: 2px solid var(--ink); }
          [data-theme='night'] .hk-verify { background: rgba(255,225,77,.08); color: #FFE14D; border-bottom-color: #FFE14D; box-shadow: 0 4px 14px -8px #FFE14D; }
          .hk-verify-btn { background: var(--ink); color: var(--bg); border: none; border-radius: 5px; padding: 5px 12px; font-weight: 700; font-size: 0.82rem; cursor: pointer; }
          [data-theme='night'] .hk-verify-btn { background: #FFE14D; color: #1F1800; }
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

      {username && unverified && (
        <div className='hk-verify' role='status'>
          <div style={{maxWidth:'1100px', margin:'0 auto', padding:'9px 16px', display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', fontSize:'0.88rem', fontWeight:600}}>
            <EnvelopeSimple size={18} weight='bold' aria-hidden='true' />
            <span style={{flex:'1 1 220px'}}>
              {resendState === 'sent'
                ? 'Sent. Check your inbox, and your spam folder too.'
                : 'Check your email to verify your account. Until then you can browse, but not post, comment, or vote.'}
            </span>
            {resendState !== 'sent' && (
              <button onClick={resend} disabled={resendState === 'sending'} className='hk-verify-btn'>
                {resendState === 'sending' ? 'Sending...' : 'Resend email'}
              </button>
            )}
            {resendMsg && <span style={{width:'100%', fontSize:'0.82rem'}}>{resendMsg}</span>}
          </div>
        </div>
      )}
    </>
  )
}