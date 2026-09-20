'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      )
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('username')
          .eq('id', data.user.id)
          .single()

        console.log('Profile result:', profile, profileError)

        if (profile?.username) {
          localStorage.setItem('hektiq_username', profile.username)
          localStorage.setItem('hektiq_user_id', data.user.id)
        } else {
          const fallback = data.user.email?.split('@')[0] || 'user'
          localStorage.setItem('hektiq_username', fallback)
          localStorage.setItem('hektiq_user_id', data.user.id)
        }
        window.location.href = '/'
      }
    } catch (e) {
      setError('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <main style={{minHeight:'100vh', background:'#080F14', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px'}}>
      <div style={{width:'100%', maxWidth:'420px', background:'#0F172A', border:'1px solid #334155', borderRadius:'20px', padding:'40px'}}>
        <Link href='/' style={{fontSize:'1.5rem', fontWeight:'700', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:'var(--font-sora)', textDecoration:'none', display:'block', marginBottom:'8px'}}>
          Hektiq
        </Link>
        <h2 style={{fontFamily:'var(--font-sora)', fontSize:'1.5rem', fontWeight:'700', color:'white', marginBottom:'8px'}}>Welcome back</h2>
        <p style={{color:'#94A3B8', fontSize:'0.875rem', marginBottom:'32px'}}>Sign in to your account</p>

        {error && (
          <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'12px', marginBottom:'20px', color:'#FCA5A5', fontSize:'0.875rem'}}>
            {error}
          </div>
        )}

        <div style={{marginBottom:'16px'}}>
          <label style={{display:'block', color:'#94A3B8', fontSize:'0.75rem', fontWeight:'500', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Email</label>
          <input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='you@example.com'
            style={{width:'100%', background:'#080F14', border:'1px solid #334155', borderRadius:'10px', padding:'12px 16px', color:'white', fontSize:'0.875rem', outline:'none', boxSizing:'border-box'}}
          />
        </div>

        <div style={{marginBottom:'24px'}}>
          <label style={{display:'block', color:'#94A3B8', fontSize:'0.75rem', fontWeight:'500', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Password</label>
          <input
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder='••••••••'
            style={{width:'100%', background:'#080F14', border:'1px solid #334155', borderRadius:'10px', padding:'12px 16px', color:'white', fontSize:'0.875rem', outline:'none', boxSizing:'border-box'}}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{width:'100%', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', borderRadius:'999px', padding:'14px', color:'white', fontSize:'0.875rem', fontWeight:'600', cursor:'pointer', marginBottom:'20px'}}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p style={{textAlign:'center', color:'#64748B', fontSize:'0.875rem'}}>
          No account?{' '}
          <Link href='/auth/signup' style={{color:'#8B5CF6', textDecoration:'none', fontWeight:'500'}}>
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  )
}