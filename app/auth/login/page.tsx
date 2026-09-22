'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email.trim() || !password) return setError('Enter your email and password.')
    setLoading(true)
    setError('')
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      )
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (error) {
        setError('That email and password don\'t match.')
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('username')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!profile?.username) {
        await supabase.auth.signOut()
        localStorage.removeItem('hektiq_username')
        localStorage.removeItem('hektiq_user_id')
        setError('Your account is missing its profile. Use the suggestion box on the homepage and I\'ll fix it.')
        setLoading(false)
        return
      }

      localStorage.setItem('hektiq_username', profile.username)
      localStorage.setItem('hektiq_user_id', data.user.id)
      window.location.href = '/'
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  const inputStyle = {width:'100%', background:'#080F14', border:'1px solid #334155', borderRadius:'10px', padding:'12px 16px', color:'white', fontSize:'0.95rem', outline:'none', boxSizing:'border-box' as const}
  const labelStyle = {display:'block', color:'#94A3B8', fontSize:'0.75rem', fontWeight:'500', marginBottom:'6px', textTransform:'uppercase' as const, letterSpacing:'0.05em'}

  return (
    <main style={{minHeight:'100vh', background:'#080F14', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
      <div style={{width:'100%', maxWidth:'420px', background:'#0F172A', border:'1px solid #1E293B', borderRadius:'20px', padding:'32px 24px'}}>
        <Link href='/' style={{fontSize:'1.5rem', fontWeight:'700', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:'var(--font-sora)', textDecoration:'none', display:'inline-block', marginBottom:'8px'}}>
          Hektiq
        </Link>
        <h2 style={{fontFamily:'var(--font-sora)', fontSize:'1.5rem', fontWeight:'700', color:'white', margin:'0 0 6px'}}>Welcome back</h2>
        <p style={{color:'#94A3B8', fontSize:'0.9rem', margin:'0 0 28px'}}>Log in to your account.</p>

        {error && (
          <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'12px', marginBottom:'18px', color:'#FCA5A5', fontSize:'0.875rem', lineHeight:'1.5'}}>
            {error}
          </div>
        )}

        <div style={{marginBottom:'16px'}}>
          <label style={labelStyle}>Email</label>
          <input type='email' value={email} onChange={e => setEmail(e.target.value)} placeholder='you@example.com' autoComplete='email' style={inputStyle} />
        </div>

        <div style={{marginBottom:'24px'}}>
          <label style={labelStyle}>Password</label>
          <input
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
            placeholder='••••••••'
            autoComplete='current-password'
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{width:'100%', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', borderRadius:'999px', padding:'14px', color:'white', fontSize:'0.95rem', fontWeight:'600', cursor:'pointer', marginBottom:'20px'}}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p style={{textAlign:'center', color:'#64748B', fontSize:'0.9rem', margin:0}}>
          No account?{' '}
          <Link href='/auth/signup' style={{color:'#A78BFA', textDecoration:'none', fontWeight:'500'}}>Join free</Link>
        </p>
      </div>
    </main>
  )
}