'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import ThemeToggle from '../../../components/ThemeToggle'

function Stripes() {
  const colors = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)']
  return (
    <div className='hk-auth-stripes'>
      {colors.map(c => <div key={c} style={{background:c}} />)}
    </div>
  )
}

export default function ResetPassword() {
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token') || ''
    setToken(t)
  }, [])

  async function handleReset() {
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('Those passwords don\'t match.')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else {
        localStorage.removeItem('hektiq_username')
        localStorage.removeItem('hektiq_user_id')
        setDone(true)
      }
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  const badLink = token !== null && !/^[a-f0-9]{64}$/.test(token)

  return (
    <main className='hk-dots' style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', color:'var(--text)'}}>
      <style>{`
        .hk-auth { width: 100%; max-width: 420px; border: 2px solid var(--border); box-shadow: var(--shadow-hard); overflow: hidden; }
        .hk-auth-stripes { display: flex; flex-direction: column; height: 14px; }
        .hk-auth-stripes div { flex: 1; }
        [data-theme='night'] .hk-auth-stripes { box-shadow: 0 0 14px rgba(255,61,154,.5); }
        .hk-auth-label { display: block; font-size: 1.05rem; margin: 0 0 6px; }
      `}</style>

      <div style={{position:'fixed', top:'14px', right:'14px'}}>
        <ThemeToggle />
      </div>

      <div className='hk-card hk-auth'>
        <Stripes />
        <div style={{padding:'28px 24px'}}>
          <Link href='/' className='font-display' style={{fontSize:'2rem', lineHeight:1, textDecoration:'none', color:'var(--text)', display:'inline-block', marginBottom:'14px'}}>
            HEKTIQ
          </Link>
          <h1 className='font-display' style={{fontSize:'2.4rem', lineHeight:1, margin:'0 0 6px'}}>NEW PASSWORD</h1>

          {done ? (
            <>
              <div style={{border:'2px solid var(--c4)', borderRadius:'8px', padding:'14px', margin:'18px 0', fontSize:'0.95rem', lineHeight:'1.6'}}>
                Your password is changed. Log in with the new one.
              </div>
              <Link href='/auth/login' className='hk-btn' style={{width:'100%', justifyContent:'center'}}>Log in</Link>
            </>
          ) : badLink ? (
            <>
              <div style={{border:'2px solid var(--c1)', borderRadius:'8px', padding:'14px', margin:'18px 0', color:'var(--c1)', fontSize:'0.95rem', fontWeight:600, lineHeight:'1.6'}}>
                That reset link doesn't look right. Ask for a new one.
              </div>
              <Link href='/auth/forgot' className='hk-btn' style={{width:'100%', justifyContent:'center'}}>Get a new link</Link>
            </>
          ) : (
            <>
              <p style={{color:'var(--muted)', fontSize:'0.95rem', margin:'0 0 24px'}}>Pick a new password. At least 8 characters.</p>

              {error && (
                <div style={{border:'2px solid var(--c1)', borderRadius:'8px', padding:'10px 12px', marginBottom:'16px', color:'var(--c1)', fontSize:'0.9rem', fontWeight:600, lineHeight:'1.5'}}>
                  {error}
                  {error.includes('Ask for a new one') && (
                    <> <Link href='/auth/forgot' style={{color:'var(--c5)', fontWeight:700}}>Get a new link</Link></>
                  )}
                </div>
              )}

              <div style={{marginBottom:'14px'}}>
                <label className='font-display hk-auth-label'>NEW PASSWORD</label>
                <input
                  type='password'
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder='••••••••'
                  autoComplete='new-password'
                  className='hk-input'
                />
              </div>

              <div style={{marginBottom:'22px'}}>
                <label className='font-display hk-auth-label'>TYPE IT AGAIN</label>
                <input
                  type='password'
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError('') }}
                  onKeyDown={e => { if (e.key === 'Enter') handleReset() }}
                  placeholder='••••••••'
                  autoComplete='new-password'
                  className='hk-input'
                />
              </div>

              <button onClick={handleReset} disabled={loading || token === null} className='hk-btn' style={{width:'100%'}}>
                {loading ? 'Saving...' : 'Save new password'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}