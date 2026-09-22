'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Header from '../../../../components/Header'
import { getAuthHeader } from '../../../../lib/authToken'
import { seededBySlug } from '../../../../lib/communities'
import { CommunityIcon } from '../../../../components/Icons'

export default function NewPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  const community = seededBySlug[slug]

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

  const labelStyle = {display:'block', color:'#94A3B8', fontSize:'0.75rem', fontWeight:'500', marginBottom:'6px', textTransform:'uppercase' as const, letterSpacing:'0.05em'}

  return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white', overflowX:'hidden'}}>
      <Header />

      <div style={{maxWidth:'720px', margin:'0 auto', padding:'24px 16px 48px'}}>
        <Link href={'/c/' + slug} style={{display:'inline-flex', alignItems:'center', gap:'8px', color: community ? community.accent : '#A78BFA', textDecoration:'none', fontSize:'0.85rem', fontWeight:'600', marginBottom:'16px'}}>
          <CommunityIcon slug={slug} size={18} />
          {community ? community.name : slug}
        </Link>

        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'1.6rem', fontWeight:'700', margin:'0 0 24px'}}>New post</h1>

        {loggedIn === false ? (
          <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'24px', textAlign:'center'}}>
            <p style={{color:'#CBD5E1', margin:'0 0 16px'}}>Log in to post. It keeps the bots out.</p>
            <div style={{display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap'}}>
              <Link href='/auth/login' style={{border:'1px solid #334155', color:'white', borderRadius:'999px', padding:'10px 22px', textDecoration:'none', fontWeight:'600'}}>Log in</Link>
              <Link href='/auth/signup' style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', color:'white', borderRadius:'999px', padding:'10px 22px', textDecoration:'none', fontWeight:'600'}}>Join free</Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'12px', marginBottom:'18px', color:'#FCA5A5', fontSize:'0.875rem'}}>
                {error}
              </div>
            )}

            <div style={{marginBottom:'18px'}}>
              <label style={labelStyle}>Title</label>
              <input
                type='text'
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='What do you want to talk about?'
                maxLength={300}
                style={{width:'100%', background:'#0F172A', border:'1px solid #334155', borderRadius:'12px', padding:'14px', color:'white', fontSize:'1rem', outline:'none', boxSizing:'border-box'}}
              />
            </div>

            <div style={{marginBottom:'24px'}}>
              <label style={labelStyle}>Body</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder='Share the details...'
                rows={10}
                style={{width:'100%', background:'#0F172A', border:'1px solid #334155', borderRadius:'12px', padding:'14px', color:'white', fontSize:'0.95rem', outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:'1.6'}}
              />
            </div>

            <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', borderRadius:'999px', padding:'12px 32px', minHeight:'44px', color:'white', fontSize:'0.9rem', fontWeight:'600', cursor:'pointer'}}
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
              <Link href={'/c/' + slug} style={{borderRadius:'999px', padding:'12px 28px', fontSize:'0.9rem', fontWeight:'600', color:'#94A3B8', border:'1px solid #334155', textDecoration:'none'}}>
                Cancel
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}