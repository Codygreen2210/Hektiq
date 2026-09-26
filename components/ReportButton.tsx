'use client'
import { useState } from 'react'
import { Flag } from '@phosphor-icons/react'

const REASONS = [
  { key: 'minor', label: 'Involves a minor or child safety' },
  { key: 'violence', label: 'Threats or violence' },
  { key: 'harassment', label: 'Harassment or hate' },
  { key: 'spam', label: 'Spam or advertising' },
  { key: 'bot', label: 'Bot or fake account' },
  { key: 'fake', label: 'Fake or copied content' },
  { key: 'other', label: 'Something else' },
]

export default function ReportButton({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function close() {
    setOpen(false)
    setReason('')
    setDetails('')
    setError('')
  }

  async function submit() {
    if (!reason) return setError('Pick a reason.')
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/posts/' + postId + '/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details, username: localStorage.getItem('hektiq_username') })
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else { setDone(true); close() }
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setSending(false)
  }

  if (done) {
    return <span style={{fontSize:'0.85rem', color:'var(--c4)', fontWeight:600}}>Reported. Thanks for keeping this place clean.</span>
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'36px', fontSize:'0.85rem'}}>
        <Flag size={15} weight='duotone' aria-hidden='true' />
        Report
      </button>

      {open && (
        <div
          onClick={close}
          style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:'16px'}}
        >
          <div
            onClick={e => e.stopPropagation()}
            role='dialog'
            aria-label='Report this post'
            style={{width:'100%', maxWidth:'440px', maxHeight:'90dvh', overflowY:'auto', background:'var(--bg)', color:'var(--text)', border:'2px solid var(--border)', borderRadius:'12px', padding:'20px', boxShadow:'var(--shadow-hard)'}}
          >
            <p className='font-display' style={{fontSize:'1.6rem', margin:'0 0 2px'}}>REPORT THIS POST</p>
            <p style={{color:'var(--muted)', fontSize:'0.9rem', margin:'0 0 16px'}}>What's wrong with it?</p>

            <div style={{display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px'}}>
              {REASONS.map(r => (
                <button
                  key={r.key}
                  onClick={() => { setReason(r.key); setError('') }}
                  style={{textAlign:'left', padding:'12px 14px', borderRadius:'8px', fontSize:'0.92rem', fontWeight:600, cursor:'pointer', border:'2px solid', borderColor: reason === r.key ? 'var(--border)' : 'var(--border-soft)', background: reason === r.key ? 'var(--surface-2)' : 'var(--surface)', color:'var(--text)'}}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {reason === 'minor' && (
              <p style={{fontSize:'0.85rem', lineHeight:1.5, color:'var(--text)', background:'var(--surface-2)', border:'2px solid var(--c1)', borderRadius:'8px', padding:'10px 12px', margin:'0 0 12px'}}>
                This hides the post right away while it gets reviewed. If a child is in danger right now, call 911.
              </p>
            )}

            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder='Anything else I should know? (optional)'
              rows={2}
              maxLength={1000}
              className='hk-input'
              style={{resize:'vertical', marginBottom:'12px'}}
            />

            {error && <p style={{color:'var(--c1)', fontSize:'0.88rem', fontWeight:600, margin:'0 0 12px'}}>{error}</p>}

            <div style={{display:'flex', gap:'10px'}}>
              <button onClick={close} className='hk-btn-ghost' style={{flex:1}}>Cancel</button>
              <button onClick={submit} disabled={sending} className='hk-btn' style={{flex:1}}>
                {sending ? 'Sending...' : 'Send report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}