'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import { getAuthHeader } from '../../lib/authToken'
import { seededBySlug } from '../../lib/communities'

const REASON_LABEL: Record<string, string> = {
  minor: 'Child safety',
  violence: 'Threats or violence',
  harassment: 'Harassment or hate',
  spam: 'Spam',
  bot: 'Bot or fake',
  fake: 'Fake or copied',
  other: 'Other',
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}

export default function AdminPage() {
  const [hidden, setHidden] = useState<any[]>([])
  const [reported, setReported] = useState<any[]>([])
  const [banned, setBanned] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const [banName, setBanName] = useState('')
  const [banReason, setBanReason] = useState('')
  const [hideContent, setHideContent] = useState(false)
  const [removeFounder, setRemoveFounder] = useState(false)
  const [banMsg, setBanMsg] = useState('')
  const [banBusy, setBanBusy] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const auth = await getAuthHeader()
      const [r1, r2] = await Promise.all([
        fetch('/api/admin/reports', { headers: { ...auth }, cache: 'no-store' }),
        fetch('/api/admin/ban', { headers: { ...auth }, cache: 'no-store' }),
      ])
      const d1 = await r1.json()
      const d2 = await r2.json()
      if (d1.error) setError(d1.error)
      else {
        setHidden(d1.hidden || [])
        setReported(d1.reported || [])
        setBanned(d2.banned || [])
      }
    } catch (e) {
      setError('Couldn\'t load. Try again.')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function act(id: string, action: 'restore' | 'remove' | 'hide' | 'dismiss') {
    if (action === 'remove' && !confirm('Remove this post for good? It stays hidden and its reports get closed.')) return
    setBusy(id + action)
    try {
      const auth = await getAuthHeader()
      const r = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ id, action })
      })
      const d = await r.json()
      if (d.error) alert(d.error)
      else await load()
    } catch (e) {
      alert('Something went wrong.')
    }
    setBusy(null)
  }

  async function ban(action: 'ban' | 'unban', name?: string) {
    const who = (name || banName).trim()
    if (!who) return setBanMsg('Type a username.')
    if (action === 'ban' && !confirm('Ban ' + who + '? They won\'t be able to post, comment, or vote.')) return
    setBanBusy(true)
    setBanMsg('')
    try {
      const auth = await getAuthHeader()
      const r = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ username: who, action, reason: banReason, hideContent, removeFounder })
      })
      const d = await r.json()
      if (d.error) setBanMsg(d.error)
      else {
        setBanMsg(d.message || 'Done.')
        if (action === 'ban') { setBanName(''); setBanReason(''); setHideContent(false); setRemoveFounder(false) }
        await load()
      }
    } catch (e) {
      setBanMsg('Something went wrong.')
    }
    setBanBusy(false)
  }

  function prefillBan(username: string) {
    if (!username || username === 'deleted account') return
    setBanName(username)
    setBanMsg('')
    setTimeout(() => document.getElementById('ban-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function Card({ p, kind }: { p: any; kind: 'hidden' | 'reported' }) {
    const community = seededBySlug[p.community_id]?.name || p.community_id
    const childSafety = p.reports.some((r: any) => r.reason === 'minor')
    const canBan = p.author && p.author !== 'deleted account'
    return (
      <div className='hk-card' style={{padding:'16px', borderLeft: '5px solid ' + (childSafety ? 'var(--c1)' : kind === 'hidden' ? 'var(--c3)' : 'var(--border)')}}>
        {childSafety && (
          <p style={{margin:'0 0 10px', fontSize:'0.85rem', fontWeight:700, color:'var(--c1)', lineHeight:1.5}}>
            Child safety report. If this involves a minor, report it at report.cybertip.org first, then use Remove for good. Don't bring it back.
          </p>
        )}
        <p style={{margin:'0 0 4px', fontSize:'0.8rem', color:'var(--muted)'}}>
          {community} · by <strong style={{color:'var(--text)'}}>{p.author}</strong> · posted {timeAgo(p.created_at)}
          {p.hidden_at && <> · hidden {timeAgo(p.hidden_at)}</>}
        </p>
        <p style={{margin:'0 0 6px', fontWeight:800, fontSize:'1.02rem', wordBreak:'break-word'}}>{p.title}</p>
        {p.body && <p style={{margin:'0 0 10px', fontSize:'0.9rem', color:'var(--muted)', lineHeight:1.6, wordBreak:'break-word', whiteSpace:'pre-wrap'}}>{p.body}</p>}
        {p.image_urls.length > 0 && !childSafety && (
          <div style={{display:'flex', gap:'6px', flexWrap:'wrap', margin:'0 0 10px'}}>
            {p.image_urls.slice(0, 4).map((u: string) => (
              <img key={u} src={u} alt='' style={{width:'72px', height:'72px', objectFit:'cover', borderRadius:'6px', border:'2px solid var(--border-soft)'}} />
            ))}
          </div>
        )}
        {p.image_urls.length > 0 && childSafety && (
          <p style={{margin:'0 0 10px', fontSize:'0.82rem', color:'var(--faint)'}}>{p.image_urls.length} photo(s) not shown here on purpose.</p>
        )}
        {p.video_url && <p style={{margin:'0 0 10px', fontSize:'0.82rem', color:'var(--faint)', wordBreak:'break-all'}}>Video: {p.video_url}</p>}

        {p.reports.length > 0 && (
          <div style={{background:'var(--surface-2)', border:'2px solid var(--border-soft)', borderRadius:'8px', padding:'10px 12px', margin:'0 0 12px'}}>
            <p style={{margin:'0 0 6px', fontSize:'0.82rem', fontWeight:700}}>{p.reports.length} open {p.reports.length === 1 ? 'report' : 'reports'}</p>
            {p.reports.slice(0, 6).map((r: any, i: number) => (
              <p key={i} style={{margin:'0 0 4px', fontSize:'0.82rem', lineHeight:1.5}}>
                <strong>{REASON_LABEL[r.reason] || r.reason}</strong>
                {r.reporter ? ' · ' + r.reporter : ' · not logged in'} · {timeAgo(r.created_at)}
                {r.details && <><br /><span style={{color:'var(--muted)'}}>“{r.details}”</span></>}
              </p>
            ))}
          </div>
        )}

        <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
          {kind === 'hidden' ? (
            <>
              {!childSafety && (
                <button onClick={() => act(p.id, 'restore')} disabled={!!busy} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'38px', fontSize:'0.85rem'}}>
                  {busy === p.id + 'restore' ? 'Working...' : 'Bring back'}
                </button>
              )}
              <button onClick={() => act(p.id, 'remove')} disabled={!!busy} className='hk-btn' style={{padding:'6px 14px', minHeight:'38px', fontSize:'0.85rem', background:'var(--c1)', color:'var(--on-c1)'}}>
                {busy === p.id + 'remove' ? 'Working...' : 'Remove for good'}
              </button>
            </>
          ) : (
            <>
              <Link href={'/c/' + p.community_id + '/post/' + p.id} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'38px', fontSize:'0.85rem'}}>Open post</Link>
              <button onClick={() => act(p.id, 'hide')} disabled={!!busy} className='hk-btn' style={{padding:'6px 14px', minHeight:'38px', fontSize:'0.85rem', background:'var(--c1)', color:'var(--on-c1)'}}>
                {busy === p.id + 'hide' ? 'Working...' : 'Hide it'}
              </button>
              <button onClick={() => act(p.id, 'dismiss')} disabled={!!busy} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'38px', fontSize:'0.85rem'}}>
                {busy === p.id + 'dismiss' ? 'Working...' : 'Dismiss reports'}
              </button>
            </>
          )}
          {canBan && (
            <button onClick={() => prefillBan(p.author)} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'38px', fontSize:'0.85rem', color:'var(--c1)'}}>
              Ban author
            </button>
          )}
        </div>
      </div>
    )
  }

  const check = { display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem', margin:'0 0 8px', cursor:'pointer' }

  return (
    <main className='hk-dots' style={{minHeight:'100vh', color:'var(--text)'}}>
      <Header />
      <div style={{maxWidth:'760px', margin:'0 auto', padding:'28px 16px 64px'}}>
        <h1 className='font-display' style={{fontSize:'2.8rem', lineHeight:1, margin:'0 0 6px'}}>REVIEW</h1>
        <p style={{color:'var(--muted)', margin:'0 0 24px'}}>Hidden and reported posts. Only admins can see this page.</p>

        {loading ? (
          <p style={{color:'var(--muted)'}}>Loading...</p>
        ) : error ? (
          <div className='hk-card' style={{padding:'24px', textAlign:'center'}}>
            <p style={{margin:0, color:'var(--c1)', fontWeight:700}}>{error}</p>
          </div>
        ) : (
          <>
            <h2 className='font-display' style={{fontSize:'1.5rem', margin:'0 0 12px'}}>HIDDEN ({hidden.length})</h2>
            {hidden.length === 0 ? (
              <div className='hk-card' style={{padding:'20px', textAlign:'center', color:'var(--muted)', borderStyle:'dashed', marginBottom:'28px'}}>Nothing hidden right now.</div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'28px'}}>
                {hidden.map(p => <Card key={p.id} p={p} kind='hidden' />)}
              </div>
            )}

            <h2 className='font-display' style={{fontSize:'1.5rem', margin:'0 0 12px'}}>REPORTED, STILL UP ({reported.length})</h2>
            {reported.length === 0 ? (
              <div className='hk-card' style={{padding:'20px', textAlign:'center', color:'var(--muted)', borderStyle:'dashed', marginBottom:'28px'}}>No open reports.</div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'28px'}}>
                {reported.map(p => <Card key={p.id} p={p} kind='reported' />)}
              </div>
            )}

            <div id='ban-form' className='hk-card' style={{padding:'18px', borderLeft:'5px solid var(--c1)', marginBottom:'20px'}}>
              <h2 className='font-display' style={{fontSize:'1.5rem', margin:'0 0 6px'}}>BAN A USER</h2>
              <p style={{fontSize:'0.88rem', color:'var(--muted)', lineHeight:1.6, margin:'0 0 12px'}}>
                Banned accounts can still browse and delete their own account, but can't post, comment, vote, or join.
              </p>
              <input
                value={banName}
                onChange={e => { setBanName(e.target.value); setBanMsg('') }}
                placeholder='username'
                aria-label='Username to ban'
                className='hk-input'
                style={{marginBottom:'8px'}}
              />
              <input
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                placeholder='Reason (only you see this)'
                aria-label='Reason'
                maxLength={300}
                className='hk-input'
                style={{marginBottom:'12px'}}
              />
              <label style={check}>
                <input type='checkbox' checked={hideContent} onChange={e => setHideContent(e.target.checked)} />
                Also hide all their posts and comments
              </label>
              <label style={check}>
                <input type='checkbox' checked={removeFounder} onChange={e => setRemoveFounder(e.target.checked)} />
                Take back their founder number
              </label>
              {banMsg && <p style={{fontSize:'0.88rem', fontWeight:700, margin:'8px 0', color: banMsg.includes('banned') || banMsg.includes('unbanned') ? 'var(--c4)' : 'var(--c1)'}}>{banMsg}</p>}
              <button onClick={() => ban('ban')} disabled={banBusy || !banName.trim()} className='hk-btn' style={{marginTop:'6px', background:'var(--c1)', color:'var(--on-c1)'}}>
                {banBusy ? 'Working...' : 'Ban'}
              </button>
            </div>

            <h2 className='font-display' style={{fontSize:'1.5rem', margin:'0 0 12px'}}>BANNED ({banned.length})</h2>
            {banned.length === 0 ? (
              <div className='hk-card' style={{padding:'20px', textAlign:'center', color:'var(--muted)', borderStyle:'dashed'}}>Nobody's banned.</div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                {banned.map(b => (
                  <div key={b.username} className='hk-card' style={{padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px', flexWrap:'wrap'}}>
                    <div style={{minWidth:0}}>
                      <p style={{margin:0, fontWeight:800}}>{b.username}</p>
                      <p style={{margin:'2px 0 0', fontSize:'0.8rem', color:'var(--muted)'}}>
                        {b.banned_at ? 'Banned ' + timeAgo(b.banned_at) : 'Banned'}{b.ban_reason ? ' · ' + b.ban_reason : ''}
                      </p>
                    </div>
                    <button onClick={() => ban('unban', b.username)} disabled={banBusy} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'36px', fontSize:'0.85rem'}}>
                      Unban
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}