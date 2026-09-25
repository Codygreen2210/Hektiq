'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '../../../components/ThemeToggle'
import { FounderPin, FounderRibbon } from '../../../components/FounderBadge'

export default function Verify() {
  const [status, setStatus] = useState<'working' | 'done' | 'error'>('working')
  const [message, setMessage] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [founder, setFounder] = useState<number | null>(null)
  const [username, setUsername] = useState('')
  const [shareMsg, setShareMsg] = useState('')

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

        const num = typeof d.founderNumber === 'number' ? d.founderNumber : null
        setFounder(num)
        setUsername(d.username || '')

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
              // Founders stay to see their number. Everyone else heads home.
              if (num === null) setTimeout(() => { window.location.href = '/' }, 2500)
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

  async function share() {
    const site = window.location.origin
    const text = 'I just became Founding Member #' + founder + ' of 1,000 on Hektiq. Your corner of the internet, run by the people in it.'
    const url = site + '/profile/' + encodeURIComponent(username)
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Hektiq', text, url })
        return
      }
      await navigator.clipboard.writeText(text + ' ' + url)
      setShareMsg('Copied. Paste it anywhere.')
    } catch (e) {
      // Share sheet closed, nothing to do
    }
  }

  const colors = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)']
  const isFounder = status === 'done' && founder !== null && founder > 0

  return (
    <main className='hk-dots' style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', color:'var(--text)'}}>
      <style>{`
        .hk-v-stripes { display: flex; flex-direction: column; height: 14px; }
        .hk-v-stripes div { flex: 1; }
        [data-theme='night'] .hk-v-stripes { box-shadow: 0 0 14px rgba(255,61,154,.5); }
        @keyframes hkvUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .hk-v-up { animation: hkvUp .5s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .hk-v-up { animation: none; } }
      `}</style>

      <div style={{position:'fixed', top:'14px', right:'14px'}}>
        <ThemeToggle />
      </div>

      <div className='hk-card' style={{width:'100%', maxWidth: isFounder ? '460px' : '420px', border:'2px solid var(--border)', boxShadow:'var(--shadow-hard)', overflow:'hidden', textAlign:'center'}}>
        <div className='hk-v-stripes'>
          {colors.map(c => <div key={c} style={{background:c}} />)}
        </div>
        <div style={{padding: isFounder ? '36px 24px 32px' : '32px 24px'}}>
          {status === 'working' && (
            <>
              <h1 className='font-display' style={{fontSize:'2.4rem', lineHeight:1, margin:'0 0 8px'}}>CHECKING YOUR LINK</h1>
              <p style={{color:'var(--muted)', margin:0}}>One second...</p>
            </>
          )}

          {isFounder && (
            <>
              <p className='font-display' style={{fontSize:'1.1rem', letterSpacing:'5px', color:'var(--muted)', margin:'0 0 18px'}}>YOU'RE VERIFIED</p>
              <div style={{display:'flex', justifyContent:'center', margin:'0 0 22px'}}>
                <FounderPin number={founder as number} size={150} />
              </div>
              <h1 className='font-display hk-neon-text hk-v-up' style={{fontSize:'2.6rem', lineHeight:1, margin:'0 0 14px', animationDelay:'1.3s'}}>
                YOU'RE FOUNDING MEMBER #{founder}
              </h1>
              <div style={{margin:'0 0 18px'}}>
                <FounderRibbon number={founder as number} />
              </div>
              <p className='hk-v-up' style={{color:'var(--muted)', margin:'0 0 22px', lineHeight:1.6, animationDelay:'1.6s'}}>
                Only 1,000 people will ever have one of these. It's yours for good, and it shows next to your name everywhere you post.
              </p>
              <div className='hk-v-up' style={{display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap', animationDelay:'1.8s'}}>
                <button onClick={share} className='hk-btn'>Share it</button>
                <Link href={loggedIn ? '/' : '/auth/login'} className='hk-btn-ghost'>
                  {loggedIn ? 'Go to Hektiq' : 'Log in'}
                </Link>
              </div>
              {shareMsg && <p style={{color:'var(--c4)', fontSize:'0.88rem', fontWeight:700, margin:'12px 0 0'}}>{shareMsg}</p>}
              {loggedIn && username && (
                <p style={{margin:'16px 0 0', fontSize:'0.88rem'}}>
                  <Link href={'/profile/' + username} style={{color:'var(--c5)', fontWeight:700, textDecoration:'none'}}>See it on your profile</Link>
                </p>
              )}
            </>
          )}

          {status === 'done' && !isFounder && (
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