'use client'
import { useState, use } from 'react'
import Link from 'next/link'

export default function NewPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!title.trim()) return setError('Title is required')
    if (!body.trim()) return setError('Body is required')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, community_slug: slug })
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else window.location.href = '/c/' + slug
    } catch (e) {
      setError('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white'}}>
      <header style={{borderBottom:'1px solid #334155', padding:'16px 64px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <Link href='/' style={{fontSize:'1.25rem', fontWeight:'600', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:'var(--font-sora)', textDecoration:'none'}}>
          Hektiq
        </Link>
        <Link href={'/c/' + slug} style={{fontSize:'0.875rem', color:'#94A3B8', textDecoration:'none'}}>
          ← Back to community
        </Link>
      </header>

      <div style={{maxWidth:'720px', margin:'0 auto', padding:'48px 32px'}}>
        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'1.75rem', fontWeight:'700', marginBottom:'32px'}}>New Post</h1>

        {error && (
          <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'12px', marginBottom:'20px', color:'#FCA5A5', fontSize:'0.875rem'}}>
            {error}
          </div>
        )}

        <div style={{marginBottom:'20px'}}>
          <label style={{display:'block', color:'#94A3B8', fontSize:'0.75rem', fontWeight:'500', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Title</label>
          <input
            type='text'
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder='What do you want to discuss?'
            style={{width:'100%', background:'#0F172A', border:'1px solid #334155', borderRadius:'10px', padding:'14px 16px', color:'white', fontSize:'1rem', outline:'none', boxSizing:'border-box'}}
          />
        </div>

        <div style={{marginBottom:'32px'}}>
          <label style={{display:'block', color:'#94A3B8', fontSize:'0.75rem', fontWeight:'500', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Body</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder='Share your thoughts...'
            rows={10}
            style={{width:'100%', background:'#0F172A', border:'1px solid #334155', borderRadius:'10px', padding:'14px 16px', color:'white', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:'1.6'}}
          />
        </div>

        <div style={{display:'flex', gap:'12px'}}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', borderRadius:'999px', padding:'12px 32px', color:'white', fontSize:'0.875rem', fontWeight:'600', cursor:'pointer'}}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
          <Link href={'/c/' + slug} style={{borderRadius:'999px', padding:'12px 32px', fontSize:'0.875rem', fontWeight:'600', color:'#94A3B8', border:'1px solid #334155', textDecoration:'none', display:'inline-block'}}>
            Cancel
          </Link>
        </div>
      </div>
    </main>
  )
}