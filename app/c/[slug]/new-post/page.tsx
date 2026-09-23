'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Header from '../../../../components/Header'
import { getAuthHeader } from '../../../../lib/authToken'
import { seededBySlug } from '../../../../lib/communities'
import { CommunityIcon } from '../../../../components/Icons'
import { ArrowLeft } from '@phosphor-icons/react'

const COLOR: Record<string, string> = {
  'outdoors': '4',
  'sports': '5',
  'money-building': '3',
  'garage': '1',
  'art-makers': '2',
}

export default function NewPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  const community = seededBySlug[slug]
  const n = COLOR[slug] || '2'
  const accent = `var(--c${n})`

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('hektiq_username'))
  }, [])

  async function handleSubmit() {
    if (!title.trim()) return setError('Add a title.')
    if (!body.trim()) return setError('Add something in the body.')
    setLoading(true)
    setError('')
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ title, body, community_slug: slug })
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else window.location.href = '/c/' + slug + '/post/' + data.post.id
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  const labelStyle = {display:'block', fontSize:'1.1rem', margin:'0 0 6px'}

  return (
    <main className='hk-dots' style={{minHeight:'100vh', color:'var(--text)', overflowX:'hidden', ['--tube' as any]: accent}}>
      <style>{`
        .hk-comm-chip { display:inline-flex; align-items:center; gap:8px; padding:6px 12px; border-radius:6px; text-decoration:none; font-weight:700; font-size:0.85rem; border:2px solid var(--ink); background: var(--tube); color: var(--chip-on); transition: background-color .6s, color .6s; }
        [data-theme='night'] .hk-comm-chip { background: transparent; color: var(--tube); border-color: var(--tube); box-shadow: 0 0 8px var(--tube); }
        .hk-compose { border-top: 6px solid var(--tube); }
        [data-theme='night'] .hk-compose { box-shadow: 0 -6px 18px -10px var(--tube); }
        .hk-compose .hk-input:focus { border-color: var(--tube); }
      `}</style>

      <Header />

      <div style={{maxWidth:'740px', margin:'0 auto', padding:'20px 16px 56px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
          <Link href={'/c/' + slug} aria-label='Back' style={{display:'flex', color:'var(--muted)', padding:'6px'}}>
            <ArrowLeft size={20} weight='bold' />
          </Link>
          <Link href={'/c/' + slug} className='hk-comm-chip' style={{['--chip-on' as any]: `var(--on-c${n})`}}>
            <CommunityIcon slug={slug} size={18} />
            {community ? community.name : slug}
          </Link>
        </div>

        <h1 className='font-display' style={{fontSize:'2.8rem', lineHeight:1, margin:'0 0 18px'}}>NEW POST</h1>

        {loggedIn === false ? (
          <div className='hk-card' style={{padding:'24px', textAlign:'center'}}>
            <p style={{margin:'0 0 16px'}}>Log in to post. It keeps the fake accounts out.</p>
            <div style={{display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap'}}>
              <Link href='/auth/login' className='hk-btn-ghost'>Log in</Link>
              <Link href='/auth/signup' className='hk-btn'>Join free</Link>
            </div>
          </div>
        ) : (
          <div className='hk-card hk-compose' style={{padding:'20px'}}>
            {error && (
              <div style={{border:'2px solid var(--c1)', borderRadius:'8px', padding:'10px 12px', marginBottom:'16px', color:'var(--c1)', fontSize:'0.9rem', fontWeight:600}}>
                {error}
              </div>
            )}

            <div style={{marginBottom:'16px'}}>
              <label className='font-display' style={labelStyle}>TITLE</label>
              <input
                type='text'
                value={title}
                onChange={e => { setTitle(e.target.value); setError('') }}
                placeholder='What do you want to talk about?'
                maxLength={300}
                className='hk-input'
                style={{fontSize:'1.05rem', fontWeight:600}}
              />
            </div>

            <div style={{marginBottom:'20px'}}>
              <label className='font-display' style={labelStyle}>BODY</label>
              <textarea
                value={body}
                onChange={e => { setBody(e.target.value); setError('') }}
                placeholder='Share the details...'
                rows={10}
                className='hk-input'
                style={{resize:'vertical', lineHeight:'1.7'}}
              />
            </div>

            <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
              <button onClick={handleSubmit} disabled={loading} className='hk-btn'>
                {loading ? 'Posting...' : 'Post it'}
              </button>
              <Link href={'/c/' + slug} className='hk-btn-ghost'>Cancel</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}