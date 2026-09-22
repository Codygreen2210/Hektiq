'use client'
import { useState } from 'react'
import { Flag } from '@phosphor-icons/react'

const REASONS = [
  { key: 'bot', label: 'Bot or fake account' },
  { key: 'ai', label: 'AI-generated content' },
  { key: 'spam', label: 'Spam or advertising' },
  { key: 'harassment', label: 'Harassment or hate' },
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
    return <span style={{fontSize:'0.8rem', color:'#6EE7B7'}}>Reported. Thanks for keeping this place clean.</span>
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{display:'inline-flex', alignItems:'center', gap:'6px', background:'transparent', border:'1px solid #334155', color:'#94A3B8', borderRadius:'999px', padding:'7px 14px', fontSize:'0.8rem', cursor:'pointer', minHeight:'36px'}}
      >
        <Flag size={15} weight='duotone' aria-hidden='true' />
        Report
      </button>

      {open && (
        <div
          onClick={close}
          style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:'16px'}}
        >
          <div
            onClick={e => e.stopPropagation()}
            role='dialog'
            aria-label='Report this post'
            style={{width:'100%', maxWidth:'440px', background:'#0F172A', border:'1px solid #334155', borderRadius:'18px', padding:'20px', marginBottom:'env(safe-area-inset-bottom)'}}
          >
            <p style={{fontFamily:'var(--font-sora)', fontWeight:'700', fontSize:'1.1rem', margin:'0 0 4px', color:'white'}}>Report this post</p>
            <p style={{color:'#94A3B8', fontSize:'0.85rem', margin:'0 0 16px'}}>What's wrong with it?</p>

            <div style={{display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px'}}>
              {REASONS.map(r => (
                <button
                  key={r.key}
                  onClick={() => { setReason(r.key); setError('') }}
                  style={{textAlign:'left', padding:'12px 14px', borderRadius:'12px', fontSize:'0.9rem', cursor:'pointer', border:'1px solid', borderColor: reason === r.key ? '#8B5CF6' : '#334155', background: reason === r.key ? 'rgba(139,92,246,0.1)' : 'transparent', color: reason === r.key ? '#C4B5FD' : '#E2E8F0'}}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder='Anything else I should know? (optional)'
              rows={2}
              maxLength={1000}
              style={{width:'100%', background:'#080F14', border:'1px solid #334155', borderRadius:'12px', padding:'12px', color:'white', fontSize:'0.9rem', outline:'none', boxSizing:'border-box', resize:'vertical', marginBottom:'12px'}}
            />

            {error && <p style={{color:'#FCA5A5', fontSize:'0.85rem', margin:'0 0 12px'}}>{error}</p>}

            <div style={{display:'flex', gap:'10px'}}>
              <button
                onClick={close}
                style={{flex:1, background:'transparent', border:'1px solid #334155', color:'#94A3B8', borderRadius:'999px', padding:'12px', fontSize:'0.9rem', cursor:'pointer'}}
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={sending}
                style={{flex:1, background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', color:'white', borderRadius:'999px', padding:'12px', fontSize:'0.9rem', fontWeight:'600', cursor:'pointer'}}
              >
                {sending ? 'Sending...' : 'Send report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}