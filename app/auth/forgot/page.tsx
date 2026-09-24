'use client'
import { useState } from 'react'
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

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSend() {
    if (!email.trim()) return setError('Enter your email.')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setSent(true)
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

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
          <h1 className='font-display' style={{fontSize:'2.4rem', lineHeight:1, margin:'0 0 6px'}}>FORGOT PASSWORD</h1>

          {sent ? (
            <>
              <div style={{border:'2px solid var(--c4)', borderRadius:'8px', padding:'14px', margin:'18px 0', fontSize:'0.95rem', lineHeight:'1.6'}}>
                If there's an account with that email, a reset link is on its way. Check your spam folder too. The link works for 1 hour.
              </div>
              <p style={{textAlign:'center', fontSize:'0.92rem', margin:0}}>
                <Link href='/auth/login' style={{color:'var(--c5)', textDecoration:'none', fontWeight:700}}>Back to log in</Link>
              </p>
            </>
          ) : (
            <>
              <p style={{color:'var(--muted)', fontSize:'0.95rem', margin:'0 0 24px'}}>Enter your email and we'll send you a link to pick a new password.</p>

              {error && (
                <div style={{border:'2px solid var(--c1)', borderRadius:'8px', padding:'10px 12px', marginBottom:'16px', color:'var(--c1)', fontSize:'0.9rem', fontWeight:600, lineHeight:'1.5'}}>
                  {error}
                </div>
              )}

              <div style={{marginBottom:'22px'}}>
                <label className='font-display hk-auth-label'>EMAIL</label>
                <input
                  type='email'
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
                  placeholder='you@example.com'
                  autoComplete='email'
                  className='hk-input'
                />
              </div>

              <button onClick={handleSend} disabled={loading} className='hk-btn' style={{width:'100%', marginBottom:'18px'}}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>

              <p style={{textAlign:'center', color:'var(--muted)', fontSize:'0.92rem', margin:0}}>
                Remembered it?{' '}
                <Link href='/auth/login' style={{color:'var(--c5)', textDecoration:'none', fontWeight:700}}>Log in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}