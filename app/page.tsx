'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import { seededCommunities, seededBySlug } from '../lib/communities'
import { CommunityIcon, ChevronIcon, CommentIcon } from '../components/Icons'

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

  const label = { fontSize:'0.75rem', color:'#64748B', textTransform:'uppercase' as const, letterSpacing:'0.08em', margin:'0 0 14px' }
  const section = { maxWidth:'1100px', margin:'0 auto', padding:'0 16px' }
  const footLink = { color:'#A78BFA', textDecoration:'none' }

  return (
    <main style={{background:'#080F14', color:'white', minHeight:'100vh', overflowX:'hidden'}}>
      <style>{`
        .hk-hero-bg {
          background-image:
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.18), transparent 70%),
            linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px);
          background-size: 100% 100%, 44px 44px, 44px 44px;
        }
        .hk-grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .hk-grid-3 { display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .hk-hero-title { font-size: 3.4rem; }
        @media (max-width: 820px) {
          .hk-grid-2, .hk-grid-3 { grid-template-columns: 1fr; }
          .hk-hero-title { font-size: 2.3rem; }
        }
        .hk-card:hover { border-color: #334155 !important; background: #111A2E !important; }
      `}</style>

      <Header />

      <section className='hk-hero-bg' style={{padding:'72px 16px 64px', textAlign:'center', borderBottom:'1px solid #1E293B'}}>
        <p style={{display:'inline-block', fontSize:'0.8rem', color:'#A78BFA', border:'1px solid #3B2F6B', background:'rgba(139,92,246,0.08)', borderRadius:'999px', padding:'6px 14px', margin:'0 0 22px'}}>
          No bots. No AI junk. Just people.
        </p>
        <h1 className='hk-hero-title' style={{fontFamily:'var(--font-sora)', fontWeight:'700', lineHeight:'1.15', margin:'0 auto 18px', maxWidth:'780px'}}>
          A place for the community,{' '}
          <span style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>built by the community.</span>
        </h1>
        <p style={{color:'#94A3B8', fontSize:'1.1rem', lineHeight:'1.7', maxWidth:'560px', margin:'0 auto 32px'}}>
          Tell us what you want and we'll build it. Every feature on Hektiq starts with someone asking for it.
        </p>
        <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
          <Link href='/auth/signup' style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', color:'white', borderRadius:'999px', padding:'13px 28px', fontWeight:'600', textDecoration:'none'}}>
            Join free
          </Link>
          <a href='#suggest' style={{border:'1px solid #334155', color:'white', borderRadius:'999px', padding:'13px 28px', fontWeight:'600', textDecoration:'none'}}>
            Suggest something
          </a>
        </div>
      </section>

      <section style={{...section, padding:'56px 16px 0'}}>
        <p style={label}>Pick your corner</p>
        <div className='hk-grid-3' style={{marginBottom:'12px'}}>
          {seededCommunities.map(c => (
            <Link key={c.slug} href={'/c/' + c.slug} className='hk-card' style={{display:'flex', alignItems:'center', gap:'14px', background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'16px', textDecoration:'none'}}>
              <div style={{width:'46px', height:'46px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', background: c.accent + '1A', color: c.accent, flexShrink:0}}>
                <CommunityIcon slug={c.slug} size={26} />
              </div>
              <div style={{flex:1, minWidth:0}}>
                <p style={{fontFamily:'var(--font-sora)', fontWeight:'700', color:'#F8FAFC', margin:'0 0 2px'}}>{c.name}</p>
                <p style={{fontSize:'0.8rem', color:'#94A3B8', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.description}</p>
              </div>
              <span style={{color:'#475569', display:'flex'}}><ChevronIcon size={16} /></span>
            </Link>
          ))}
          <Link href='/communities' className='hk-card' style={{display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'1px dashed #334155', borderRadius:'14px', padding:'16px', textDecoration:'none', color:'#94A3B8', fontSize:'0.9rem', fontWeight:'600'}}>
            See all communities
          </Link>
        </div>
      </section>

      <section style={{...section, padding:'56px 16px 0'}}>
        <p style={label}>Latest from the community</p>
        {loadingPosts ? (
          <p style={{color:'#64748B'}}>Loading...</p>
        ) : posts.length === 0 ? (
          <div style={{border:'1px dashed #334155', borderRadius:'14px', padding:'28px 16px', textAlign:'center', color:'#64748B'}}>
            It's quiet in here. Be the first to post.
          </div>
        ) : (
          <div className='hk-grid-2'>
            {posts.map(post => {
              const c = seededBySlug[post.community_id]
              return (
                <Link key={post.id} href={'/c/' + post.community_id + '/post/' + post.id} className='hk-card' style={{display:'block', background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'16px', textDecoration:'none'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.78rem', color:'#64748B', marginBottom:'8px'}}>
                    <span style={{color: c ? c.accent : '#A78BFA', display:'flex', alignItems:'center', gap:'6px'}}>
                      <CommunityIcon slug={post.community_id} size={16} />
                      {c ? c.name : post.community_id}
                    </span>
                    <span>· {timeAgo(post.created_at)}</span>
                  </div>
                  <p style={{fontFamily:'var(--font-sora)', fontWeight:'700', color:'#F8FAFC', lineHeight:'1.4', margin:'0 0 6px', wordBreak:'break-word'}}>{post.title}</p>
                  <p style={{fontSize:'0.85rem', color:'#94A3B8', lineHeight:'1.5', margin:'0 0 10px', wordBreak:'break-word'}}>
                    {(post.body || '').substring(0, 110)}{(post.body || '').length > 110 ? '...' : ''}
                  </p>
                  <div style={{display:'flex', gap:'14px', fontSize:'0.78rem', color:'#64748B'}}>
                    <span>▲ {post.upvotes || 0}</span>
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}><CommentIcon size={14} /> Discuss</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section style={{...section, padding:'56px 16px 0'}}>
        <p style={label}>Why Hektiq</p>
        <div className='hk-grid-3'>
          {[
            { t: 'Real people only', d: 'Bot accounts and AI-generated posts get cut. If you see one, report it and it goes.' },
            { t: 'No karma farming', d: 'Posts rise because people find them useful, not because someone gamed the system.' },
            { t: 'You decide what\'s next', d: 'Features come from the suggestion box below. Ask for it and we\'ll build it.' },
          ].map(f => (
            <div key={f.t} style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'18px'}}>
              <p style={{fontFamily:'var(--font-sora)', fontWeight:'700', margin:'0 0 6px'}}>{f.t}</p>
              <p style={{fontSize:'0.88rem', color:'#94A3B8', lineHeight:'1.6', margin:0}}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id='suggest' style={{maxWidth:'640px', margin:'0 auto', padding:'64px 16px 24px'}}>
        <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'18px', padding:'24px'}}>
          <h2 style={{fontFamily:'var(--font-sora)', fontSize:'1.4rem', fontWeight:'700', margin:'0 0 6px'}}>Suggestion box</h2>
          <p style={{color:'#94A3B8', fontSize:'0.92rem', lineHeight:'1.6', margin:'0 0 20px'}}>
            Something you want, something that's broken, or something that bugs you. It goes straight to me, and I read every one.
          </p>

          {sent ? (
            <div style={{background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.35)', borderRadius:'12px', padding:'16px', color:'#6EE7B7'}}>
              Got it. Thanks for helping build this place.
              <button onClick={() => setSent(false)} style={{display:'block', marginTop:'10px', background:'none', border:'none', color:'#A78BFA', cursor:'pointer', padding:0, fontSize:'0.88rem'}}>
                Send another
              </button>
            </div>
          ) : (
            <>
              <div style={{display:'flex', gap:'8px', marginBottom:'14px', flexWrap:'wrap'}}>
                {[['idea', 'Idea'], ['complaint', 'Complaint'], ['bug', 'Something\'s broken']].map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setType(k)}
                    style={{borderRadius:'999px', padding:'8px 16px', minHeight:'40px', fontSize:'0.85rem', fontWeight:'600', cursor:'pointer', border:'1px solid', borderColor: type === k ? '#8B5CF6' : '#334155', color: type === k ? '#C4B5FD' : '#94A3B8', background: type === k ? 'rgba(139,92,246,0.1)' : 'transparent'}}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={e => { setMessage(e.target.value); setError('') }}
                placeholder='I wish Hektiq had...'
                rows={5}
                maxLength={2000}
                style={{width:'100%', background:'#080F14', border:'1px solid #334155', borderRadius:'12px', padding:'14px', color:'white', fontSize:'0.95rem', outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:'1.6', marginBottom:'12px'}}
              />

              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='Your email, if you want a reply (optional)'
                style={{width:'100%', background:'#080F14', border:'1px solid #334155', borderRadius:'12px', padding:'12px 14px', color:'white', fontSize:'0.9rem', outline:'none', boxSizing:'border-box', marginBottom:'12px'}}
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

              {error && <p style={{color:'#FCA5A5', fontSize:'0.85rem', margin:'0 0 12px'}}>{error}</p>}

              <button
                onClick={sendSuggestion}
                disabled={sending}
                style={{width:'100%', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', borderRadius:'999px', padding:'14px', color:'white', fontSize:'0.95rem', fontWeight:'600', cursor:'pointer'}}
              >
                {sending ? 'Sending...' : 'Send it'}
              </button>
            </>
          )}
        </div>
      </section>

      <section style={{maxWidth:'640px', margin:'0 auto', padding:'8px 16px 64px', textAlign:'center'}}>
        <p style={{color:'#64748B', fontSize:'0.88rem', lineHeight:'1.7', margin:0}}>
          Built by one guy in Louisiana, after work, one piece at a time.
        </p>
        <p style={{fontSize:'0.88rem', margin:'6px 0 0'}}>
          <a href='https://substack.com/@hektiqmind' target='_blank' rel='noopener noreferrer' style={footLink}>Read the build journal</a>
          <span style={{color:'#475569'}}>{' · '}</span>
          <a href='https://x.com/HektiqMind' target='_blank' rel='noopener noreferrer' style={footLink}>Follow on X</a>
        </p>
      </section>

      <footer style={{borderTop:'1px solid #1E293B', padding:'24px 16px', textAlign:'center', color:'#64748B', fontSize:'0.85rem'}}>
        Hektiq 2026 — For everyone building from nothing
      </footer>
    </main>
  )
}