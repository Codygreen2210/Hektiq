'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    if (!username.trim()) return setError('Username is required')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else window.location.href = '/'
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
        <h2 style={{fontFamily:'var(--font-sora)', fontSize:'1.5rem', fontWeight:'700', color:'white', marginBottom:'8px'}}>Create your account</h2>
        <p style={{color:'#94A3B8', fontSize:'0.875rem', marginBottom:'32px'}}>Join the community. Free forever.</p>

        {error && (
          <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'12px', marginBottom:'20px', color:'#FCA5A5', fontSize:'0.875rem'}}>
            {error}
          </div>
        )}

        <div style={{marginBottom:'16px'}}>
          <label style={{display:'block', color:'#94A3B8', fontSize:'0.75rem', fontWeight:'500', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Username</label>
          <input
            type='text'
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder='yourname'
            style={{width:'100%', background:'#080F14', border:'1px solid #334155', borderRadius:'10px', padding:'12px 16px', color:'white', fontSize:'0.875rem', outline:'none', boxSizing:'border-box'}}
          />
        </div>

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
          onClick={handleSignup}
          disabled={loading}
          style={{width:'100%', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', borderRadius:'999px', padding:'14px', color:'white', fontSize:'0.875rem', fontWeight:'600', cursor:'pointer', marginBottom:'20px'}}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p style={{textAlign:'center', color:'#64748B', fontSize:'0.875rem'}}>
          Already have an account?{' '}
          <Link href='/auth/login' style={{color:'#8B5CF6', textDecoration:'none', fontWeight:'500'}}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}