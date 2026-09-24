'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import HeroScene from '../components/HeroScene'
import { seededCommunities, seededBySlug } from '../lib/communities'
import { CommunityIcon, ChevronIcon, CommentIcon } from '../components/Icons'

const COLOR: Record<string, string> = {
  'outdoors': '4',
  'sports': '5',
  'money-building': '3',
  'garage': '1',
  'art-makers': '2',
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [type, setType] = useState('idea')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/posts/latest')
      .then(r => r.json())
      .then(d => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoadingPosts(false))
  }, [])

  async function sendSuggestion() {
    setError('')
    if (message.trim().length < 10) return setError('Tell us a little more (at least 10 characters).')
    setSending(true)
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, email, website, username: localStorage.getItem('hektiq_username') })
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else { setSent(true); setMessage(''); setEmail('') }
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setSending(false)
  }

  const label = { fontSize:'1.4rem', color:'var(--text)', margin:'0 0 14px' }
  const section = { maxWidth:'1100px', margin:'0 auto', padding:'56px 16px 0' }

  return (
    <main className='hk-dots' style={{minHeight:'100vh', overflowX:'hidden', color:'var(--text)'}}>
      <style>{`
        .hk-grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .hk-grid-3 { display:grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        @media (max-width: 820px) { .hk-grid-2, .hk-grid-3 { grid-template-columns: 1fr; } }

        .hk-comm { display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:8px; text-decoration:none; border:2px solid var(--ink); box-shadow: var(--shadow-hard); transition: transform .15s ease, box-shadow .15s ease, background-color .6s ease, color .6s ease; }
        .hk-comm:hover { transform: translate(-2px,-2px); }
        .hk-comm-title, .hk-comm-icon, .hk-comm-desc { color: var(--comm-on); transition: color .6s ease, text-shadow .6s ease; }

        [data-theme='night'] .hk-comm { background: transparent !important; border-color: currentColor; box-shadow: 0 0 10px currentColor; }
        [data-theme='night'] .hk-comm-title { color: var(--comm-glow); text-shadow: 0 0 10px var(--comm-glow); }
        [data-theme='night'] .hk-comm-icon { color: var(--comm-glow); filter: drop-shadow(0 0 6px var(--comm-glow)); }
        [data-theme='night'] .hk-comm-desc { color: var(--muted); }
        [data-theme='night'] .hk-comm:hover { box-shadow: 0 0 18px currentColor; }

        .hk-type { border-radius:6px; padding:8px 14px; min-height:40px; font-size:0.85rem; font-weight:600; cursor:pointer; border:2px solid var(--border-soft); background:transparent; color:var(--muted); }
        .hk-type.active { border-color: var(--border); color: var(--text); background: var(--surface-2); }
      `}</style>

      <Header />
      <HeroScene />

      <div style={{textAlign:'center', padding:'0 16px 8px'}}>
        <p style={{color:'var(--text)', fontSize:'1.2rem', fontWeight:600, lineHeight:'1.5', maxWidth:'540px', margin:'0 auto 8px'}}>
          Your corner of the internet, run by the people in it.
        </p>
        <p style={{color:'var(--muted)', fontSize:'1rem', lineHeight:'1.6', maxWidth:'520px', margin:'0 auto 26px'}}>
          Tell us what you want and we'll build it.
        </p>
        <div style={{display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap'}}>
          <Link href='/auth/signup' className='hk-btn'>Join free</Link>
          <a href='#suggest' className='hk-btn-ghost'>Suggest something</a>
        </div>
      </div>

      <section style={section}>
        <h2 className='font-display' style={label}>PICK YOUR CORNER</h2>
        <div className='hk-grid-3'>
          {seededCommunities.map(c => {
            const n = COLOR[c.slug] || '1'
            const vars = { background:`var(--c${n})`, color:`var(--c${n})`, ['--comm-on' as any]:`var(--on-c${n})`, ['--comm-glow' as any]:`var(--c${n})` }
            return (
              <Link key={c.slug} href={'/c/' + c.slug} className='hk-comm' style={vars}>
                <span className='hk-comm-icon' style={{display:'flex'}}>
                  <CommunityIcon slug={c.slug} size={28} />
                </span>
                <div style={{flex:1, minWidth:0}}>
                  <p className='font-display hk-comm-title' style={{fontSize:'1.45rem', lineHeight:1, margin:'0 0 3px'}}>{c.name.toUpperCase()}</p>
                  <p className='hk-comm-desc' style={{fontSize:'0.8rem', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.description}</p>
                </div>
              </Link>
            )
          })}
          <Link href='/communities' className='hk-card' style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'14px', textDecoration:'none', color:'var(--muted)', fontWeight:600, borderStyle:'dashed'}}>
            See all communities <ChevronIcon size={16} />
          </Link>
        </div>
      </section>

      <section style={section}>
        <h2 className='font-display' style={label}>LATEST FROM THE COMMUNITY</h2>
        {loadingPosts ? (
          <p style={{color:'var(--muted)'}}>Loading...</p>
        ) : posts.length === 0 ? (
          <div className='hk-card' style={{padding:'28px 16px', textAlign:'center', color:'var(--muted)', borderStyle:'dashed'}}>
            It's quiet in here. Be the first to post.
          </div>
        ) : (
          <div className='hk-grid-2'>
            {posts.map(post => {
              const c = seededBySlug[post.community_id]
              const n = COLOR[post.community_id] || '1'
              return (
                <Link key={post.id} href={'/c/' + post.community_id + '/post/' + post.id} className='hk-card' style={{display:'block', padding:'16px', textDecoration:'none', color:'var(--text)'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.8rem', color:'var(--muted)', marginBottom:'8px'}}>
                    <span style={{color:`var(--c${n})`, display:'flex', alignItems:'center', gap:'6px', fontWeight:600}}>
                      <CommunityIcon slug={post.community_id} size={16} />
                      {c ? c.name : post.community_id}
                    </span>
                    <span>· {timeAgo(post.created_at)}</span>
                  </div>
                  <p style={{fontWeight:700, fontSize:'1.02rem', lineHeight:'1.4', margin:'0 0 6px', wordBreak:'break-word'}}>{post.title}</p>
                  <p style={{fontSize:'0.88rem', color:'var(--muted)', lineHeight:'1.55', margin:'0 0 10px', wordBreak:'break-word'}}>
                    {(post.body || '').substring(0, 110)}{(post.body || '').length > 110 ? '...' : ''}
                  </p>
                  <div style={{display:'flex', gap:'14px', fontSize:'0.8rem', color:'var(--faint)'}}>
                    <span>▲ {post.upvotes || 0}</span>
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}><CommentIcon size={14} /> Discuss</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section style={section}>
        <h2 className='font-display' style={label}>WHY HEKTIQ</h2>
        <div className='hk-grid-3'>
          {[
            { t: 'REAL PEOPLE ONLY', d: 'One account, one vote. Fake accounts and spam get reported and removed.', n: '4' },
            { t: 'NO KARMA FARMING', d: 'Posts rise because people find them useful, not because someone gamed the system.', n: '5' },
            { t: 'YOU DECIDE WHAT\'S NEXT', d: 'Features come from the suggestion box below. Ask for it and we\'ll build it.', n: '1' },
          ].map(f => (
            <div key={f.t} className='hk-card' style={{padding:'18px', borderTop:`6px solid var(--c${f.n})`}}>
              <p className='font-display' style={{fontSize:'1.35rem', margin:'0 0 6px'}}>{f.t}</p>
              <p style={{fontSize:'0.9rem', color:'var(--muted)', lineHeight:'1.6', margin:0}}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id='suggest' style={{maxWidth:'640px', margin:'0 auto', padding:'64px 16px 24px'}}>
        <div className='hk-card' style={{padding:'24px', borderColor:'var(--border)', boxShadow:'var(--shadow-hard)'}}>
          <h2 className='font-display' style={{fontSize:'2rem', margin:'0 0 6px'}}>SUGGESTION BOX</h2>
          <p style={{color:'var(--muted)', fontSize:'0.95rem', lineHeight:'1.6', margin:'0 0 20px'}}>
            Something you want, something that's broken, or something that bugs you. It goes straight to me, and I read every one.
          </p>

          {sent ? (
            <div style={{border:'2px solid var(--c4)', borderRadius:'8px', padding:'16px', color:'var(--text)'}}>
              Got it. Thanks for helping build this place.
              <button onClick={() => setSent(false)} style={{display:'block', marginTop:'10px', background:'none', border:'none', color:'var(--c5)', cursor:'pointer', padding:0, fontSize:'0.9rem', fontWeight:600}}>
                Send another
              </button>
            </div>
          ) : (
            <>
              <div style={{display:'flex', gap:'8px', marginBottom:'14px', flexWrap:'wrap'}}>
                {[['idea', 'Idea'], ['complaint', 'Complaint'], ['bug', 'Something\'s broken']].map(([k, l]) => (
                  <button key={k} onClick={() => setType(k)} className={'hk-type' + (type === k ? ' active' : '')}>{l}</button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={e => { setMessage(e.target.value); setError('') }}
                placeholder='I wish Hektiq had...'
                rows={5}
                maxLength={2000}
                className='hk-input'
                style={{resize:'vertical', lineHeight:'1.6', marginBottom:'12px'}}
              />

              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='Your email, if you want a reply (optional)'
                className='hk-input'
                style={{marginBottom:'12px'}}
              />

              <input
                type='text'
                value={website}
                onChange={e => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete='off'
                aria-hidden='true'
                style={{position:'absolute', left:'-9999px', width:'1px', height:'1px', opacity:0}}
              />

              {error && <p style={{color:'var(--c1)', fontSize:'0.88rem', fontWeight:600, margin:'0 0 12px'}}>{error}</p>}

              <button onClick={sendSuggestion} disabled={sending} className='hk-btn' style={{width:'100%'}}>
                {sending ? 'Sending...' : 'Send it'}
              </button>
            </>
          )}
        </div>
      </section>

      <section style={{maxWidth:'640px', margin:'0 auto', padding:'8px 16px 64px', textAlign:'center'}}>
        <p style={{color:'var(--muted)', fontSize:'0.9rem', lineHeight:'1.7', margin:0}}>
          Built by one guy in Louisiana, after work, one piece at a time.
        </p>
        <p style={{fontSize:'0.9rem', margin:'6px 0 0', fontWeight:600}}>
          <a href='https://substack.com/@hektiqmind' target='_blank' rel='noopener noreferrer' style={{color:'var(--c5)', textDecoration:'none'}}>Read the build journal</a>
          <span style={{color:'var(--faint)'}}>{' · '}</span>
          <a href='https://x.com/HektiqMind' target='_blank' rel='noopener noreferrer' style={{color:'var(--c1)', textDecoration:'none'}}>Follow on X</a>
        </p>
      </section>
    </main>
  )
}