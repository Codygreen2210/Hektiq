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

export default function Signup() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const cleanName = username.trim().toLowerCase()
  const nameOk = /^[a-z0-9_]{3,20}$/.test(cleanName)

  async function handleSignup() {
    setError('')
    if (!nameOk) return setError('Username must be 3 to 20 characters: letters, numbers, or underscores.')
    if (!email.trim()) return setError('Enter your email.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username: cleanName })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      )
      const { data: login, error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (loginError || !login.user) {
        window.location.href = '/auth/login'
        return
      }
      localStorage.setItem('hektiq_username', cleanName)
      localStorage.setItem('hektiq_user_id', login.user.id)
      window.location.href = '/'
    } catch (e) {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
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
          <h1 className='font-display' style={{fontSize:'2.4rem', lineHeight:1, margin:'0 0 6px'}}>JOIN HEKTIQ</h1>
          <p style={{color:'var(--muted)', fontSize:'0.95rem', margin:'0 0 24px'}}>Your corner of the internet, run by the people in it. Free.</p>

          {error && (
            <div style={{border:'2px solid var(--c1)', borderRadius:'8px', padding:'10px 12px', marginBottom:'16px', color:'var(--c1)', fontSize:'0.9rem', fontWeight:600, lineHeight:'1.5'}}>
              {error}
            </div>
          )}

          <div style={{marginBottom:'14px'}}>
            <label className='font-display hk-auth-label'>USERNAME</label>
            <input
              type='text'
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder='yourname'
              autoComplete='username'
              maxLength={20}
              className='hk-input'
            />
            <p style={{fontSize:'0.8rem', margin:'6px 0 0', color: username && !nameOk ? 'var(--c1)' : 'var(--faint)', fontWeight: username && !nameOk ? 600 : 400}}>
              {username && nameOk ? 'hektiq.com/profile/' + cleanName : '3 to 20 characters: letters, numbers, or underscores'}
            </p>
          </div>

          <div style={{marginBottom:'14px'}}>
            <label className='font-display hk-auth-label'>EMAIL</label>
            <input type='email' value={email} onChange={e => { setEmail(e.target.value); setError('') }} placeholder='you@example.com' autoComplete='email' className='hk-input' />
          </div>

          <div style={{marginBottom:'22px'}}>
            <label className='font-display hk-auth-label'>PASSWORD</label>
            <input
              type='password'
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => { if (e.key === 'Enter') handleSignup() }}
              placeholder='At least 8 characters'
              autoComplete='new-password'
              className='hk-input'
            />
          </div>

          <button onClick={handleSignup} disabled={loading} className='hk-btn' style={{width:'100%', marginBottom:'18px'}}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p style={{textAlign:'center', color:'var(--muted)', fontSize:'0.92rem', margin:0}}>
            Already have an account?{' '}
            <Link href='/auth/login' style={{color:'var(--c5)', textDecoration:'none', fontWeight:700}}>Log in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}