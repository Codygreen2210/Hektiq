'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '../../../components/ThemeToggle'

export default function Verify() {
  const [status, setStatus] = useState<'working' | 'done' | 'error'>('working')
  const [message, setMessage] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) {
      setStatus('error')
      setMessage('That link is missing something. Open it straight from the email.')
      return
    }

    async function run() {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        const d = await res.json()
        if (!d.ok) {
          setStatus('error')
          setMessage(d.error || 'Something went wrong.')
          return
        }

        if (d.tokenHash) {
          try {
            const { createClient } = await import('@supabase/supabase-js')
            const supabase = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL as string,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
            )
            const { data, error } = await supabase.auth.verifyOtp({ token_hash: d.tokenHash, type: 'magiclink' })
            if (!error && data.session) {
              localStorage.setItem('hektiq_username', d.username)
              localStorage.setItem('hektiq_user_id', d.userId)
              setLoggedIn(true)
              setStatus('done')
              setTimeout(() => { window.location.href = '/' }, 2500)
              return
            }
          } catch (e) {}
        }

        setStatus('done')
      } catch (e) {
        setStatus('error')
        setMessage('Something went wrong. Try again.')
      }
    }
    run()
  }, [])

  const colors = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)']

  return (
    <main className='hk-dots' style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', color:'var(--text)'}}>
      <style>{`
        .hk-v-stripes { display: flex; flex-direction: column; height: 14px; }
        .hk-v-stripes div { flex: 1; }
        [data-theme='night'] .hk-v-stripes { box-shadow: 0 0 14px rgba(255,61,154,.5); }
      `}</style>

      <div style={{position:'fixed', top:'14px', right:'14px'}}>
        <ThemeToggle />
      </div>

      <div className='hk-card' style={{width:'100%', maxWidth:'420px', border:'2px solid var(--border)', boxShadow:'var(--shadow-hard)', overflow:'hidden', textAlign:'center'}}>
        <div className='hk-v-stripes'>
          {colors.map(c => <div key={c} style={{background:c}} />)}
        </div>
        <div style={{padding:'32px 24px'}}>
          {status === 'working' && (
            <>
              <h1 className='font-display' style={{fontSize:'2.4rem', lineHeight:1, margin:'0 0 8px'}}>CHECKING YOUR LINK</h1>
              <p style={{color:'var(--muted)', margin:0}}>One second...</p>
            </>
          )}
          {status === 'done' && (
            <>
              <h1 className='font-display hk-neon-text' style={{fontSize:'2.8rem', lineHeight:1, margin:'0 0 10px'}}>YOU'RE VERIFIED</h1>
              <p style={{color:'var(--muted)', margin:'0 0 22px', lineHeight:1.6}}>
                {loggedIn
                  ? 'You\'re logged in and good to go. Taking you to Hektiq...'
                  : 'You can post, comment, and vote now. Log in to get started.'}
              </p>
              <Link href={loggedIn ? '/' : '/auth/login'} className='hk-btn'>
                {loggedIn ? 'Go to Hektiq' : 'Log in'}
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <h1 className='font-display' style={{fontSize:'2.4rem', lineHeight:1, margin:'0 0 10px'}}>THAT DIDN'T WORK</h1>
              <p style={{color:'var(--muted)', margin:'0 0 22px', lineHeight:1.6}}>{message}</p>
              <Link href='/auth/login' className='hk-btn'>Log in</Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}