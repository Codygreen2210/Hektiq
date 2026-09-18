'use client'
import Link from 'next/link'
import { useState, useEffect, use } from 'react'

export default function PostPage({ params }: { params: Promise<{ slug: string; postId: string }> }) {
  const { slug, postId } = use(params)
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch('/api/posts/' + postId)
        const data = await res.json()
        if (data.post) setPost(data.post)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    fetchPost()
  }, [postId])

  async function handleComment() {
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: comment, post_id: postId })
      })
      const data = await res.json()
      if (data.comment) {
        setComments([...comments, data.comment])
        setComment('')
      }
    } catch (e) {
      console.error(e)
    }
    setSubmitting(false)
  }

  if (loading) return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#64748B'}}>Loading...</p>
    </main>
  )

  if (!post) return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'2rem', marginBottom:'16px'}}>Post not found</h1>
        <Link href={'/c/' + slug} style={{color:'#8B5CF6'}}>Back to community</Link>
      </div>
    </main>
  )

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
        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'1.75rem', fontWeight:'700', color:'white', marginBottom:'16px'}}>{post.title}</h1>
        <p style={{color:'#475569', fontSize:'0.75rem', marginBottom:'32px'}}>{new Date(post.created_at).toLocaleDateString()}</p>
        <p style={{color:'#CBD5E1', fontSize:'1rem', lineHeight:'1.8', marginBottom:'48px'}}>{post.body}</p>

        <div style={{borderTop:'1px solid #334155', paddingTop:'32px'}}>
          <h2 style={{fontFamily:'var(--font-sora)', fontSize:'1.25rem', fontWeight:'700', marginBottom:'24px'}}>
            Comments {comments.length > 0 && `(${comments.length})`}
          </h2>

          <div style={{marginBottom:'24px'}}>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder='Share your thoughts...'
              rows={4}
              style={{width:'100%', background:'#0F172A', border:'1px solid #334155', borderRadius:'10px', padding:'14px 16px', color:'white', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:'1.6', marginBottom:'12px'}}
            />
            <button
              onClick={handleComment}
              disabled={submitting}
              style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', borderRadius:'999px', padding:'10px 24px', color:'white', fontSize:'0.875rem', fontWeight:'600', cursor:'pointer'}}
            >
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
          </div>

          {comments.length === 0 ? (
            <div style={{background:'#0F172A', border:'1px solid #334155', borderRadius:'16px', padding:'32px', textAlign:'center'}}>
              <p style={{color:'#64748B', fontSize:'0.875rem'}}>No comments yet. Start the conversation.</p>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              {comments.map((c, i) => (
                <div key={i} style={{background:'#0F172A', border:'1px solid #334155', borderRadius:'12px', padding:'20px'}}>
                  <p style={{color:'#CBD5E1', fontSize:'0.875rem', lineHeight:'1.6'}}>{c.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer style={{borderTop:'1px solid #334155', padding:'24px', textAlign:'center', fontSize:'0.875rem', color:'#64748B', marginTop:'48px'}}>
        Hektiq 2026 — For everyone building from nothing
      </footer>
    </main>
  )
}