'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '../../components/ThemeToggle'

export default function Unsubscribe() {
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<'working' | 'out' | 'in' | 'error'>('working')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function send(t: string, resubscribe: boolean) {
    setBusy(true)
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t, resubscribe })
      })
      const d = await res.json()
      if (d.error) { setStatus('error'); setMessage(d.error) }
      else setStatus(d.subscribed ? 'in' : 'out')
    } catch (e) {
      setStatus('error')
      setMessage('Something went wrong. Try again.')
    }
    setBusy(false)
  }

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token')
    if (!t) {
      setStatus('error')
      setMessage('That link is missing something. Open it straight from the email.')
      return
    }
    setToken(t)
    send(t, false)
  }, [])

  const colors = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)']

  return (
    <main className='hk-dots' style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', color:'var(--text)'}}>
      <style>{`
        .hk-u-stripes { display: flex; flex-direction: column; height: 14px; }
        .hk-u-stripes div { flex: 1; }
        [data-theme='night'] .hk-u-stripes { box-shadow: 0 0 14px rgba(255,61,154,.5); }
      `}</style>

      <div style={{position:'fixed', top:'14px', right:'14px'}}>
        <ThemeToggle />
      </div>

      <div className='hk-card' style={{width:'100%', maxWidth:'420px', border:'2px solid var(--border)', boxShadow:'var(--shadow-hard)', overflow:'hidden', textAlign:'center'}}>
        <div className='hk-u-stripes'>
          {colors.map(c => <div key={c} style={{background:c}} />)}
        </div>
        <div style={{padding:'32px 24px'}}>
          {status === 'working' && (
            <h1 className='font-display' style={{fontSize:'2.2rem', lineHeight:1, margin:0}}>ONE SECOND...</h1>
          )}
          {status === 'out' && (
            <>
              <h1 className='font-display' style={{fontSize:'2.4rem', lineHeight:1, margin:'0 0 10px'}}>YOU'RE UNSUBSCRIBED</h1>
              <p style={{color:'var(--muted)', margin:'0 0 22px', lineHeight:1.6}}>No more update emails. You'll still get account emails, like password resets.</p>
              <div style={{display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap'}}>
                <Link href='/' className='hk-btn'>Go to Hektiq</Link>
                <button onClick={() => token && send(token, true)} disabled={busy} className='hk-btn-ghost'>
                  {busy ? '...' : 'Oops, resubscribe me'}
                </button>
              </div>
            </>
          )}
          {status === 'in' && (
            <>
              <h1 className='font-display' style={{fontSize:'2.4rem', lineHeight:1, margin:'0 0 10px'}}>YOU'RE BACK IN</h1>
              <p style={{color:'var(--muted)', margin:'0 0 22px', lineHeight:1.6}}>You'll get the occasional update again.</p>
              <Link href='/' className='hk-btn'>Go to Hektiq</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <h1 className='font-display' style={{fontSize:'2.4rem', lineHeight:1, margin:'0 0 10px'}}>THAT DIDN'T WORK</h1>
              <p style={{color:'var(--muted)', margin:'0 0 22px', lineHeight:1.6}}>{message}</p>
              <Link href='/' className='hk-btn'>Go to Hektiq</Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}