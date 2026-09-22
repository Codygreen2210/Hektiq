'use client'
import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import Header from '../../../../../components/Header'
import ReportButton from '../../../../../components/ReportButton'
import { seededBySlug } from '../../../../../lib/communities'
import { CommunityIcon } from '../../../../../components/Icons'

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}

export default function PostPage({ params }: { params: Promise<{ slug: string; postId: string }> }) {
  const { slug, postId } = use(params)
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const community = seededBySlug[slug]

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/posts/' + postId)
        const data = await res.json()
        if (data.post) setPost(data.post)
      } catch (e) {
        console.error(e)
      }
      try {
        const res = await fetch('/api/comments?post_id=' + postId)
        const data = await res.json()
        if (data.comments) setComments(data.comments)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
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
        setComments(prev => [...prev, data.comment])
        setComment('')
      }
    } catch (e) {
      console.error(e)
    }
    setSubmitting(false)
  }

  if (loading) return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white'}}>
      <Header />
      <p style={{color:'#64748B', textAlign:'center', padding:'64px 16px'}}>Loading...</p>
    </main>
  )

  if (!post) return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white'}}>
      <Header />
      <div style={{textAlign:'center', padding:'64px 16px'}}>
        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'1.6rem', marginBottom:'16px'}}>Post not found</h1>
        <Link href={'/c/' + slug} style={{color:'#8B5CF6'}}>Back to community</Link>
      </div>
    </main>
  )

  return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white', overflowX:'hidden'}}>
      <Header />

      <div style={{maxWidth:'720px', margin:'0 auto', padding:'24px 16px 48px'}}>
        <Link href={'/c/' + slug} style={{display:'inline-flex', alignItems:'center', gap:'8px', color: community ? community.accent : '#A78BFA', textDecoration:'none', fontSize:'0.85rem', fontWeight:'600', marginBottom:'18px'}}>
          <CommunityIcon slug={slug} size={18} />
          {community ? community.name : slug}
        </Link>

        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'1.6rem', fontWeight:'700', color:'white', lineHeight:'1.3', margin:'0 0 10px', wordBreak:'break-word'}}>{post.title}</h1>
        <p style={{color:'#64748B', fontSize:'0.8rem', margin:'0 0 24px'}}>{timeAgo(post.created_at)}</p>
        <p style={{color:'#CBD5E1', fontSize:'1rem', lineHeight:'1.8', margin:'0 0 24px', whiteSpace:'pre-wrap', wordBreak:'break-word'}}>{post.body}</p>

        <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', paddingBottom:'24px', borderBottom:'1px solid #1E293B', marginBottom:'28px'}}>
          <span style={{fontSize:'0.85rem', color:'#94A3B8'}}>▲ {post.upvotes || 0}</span>
          <div style={{marginLeft:'auto'}}>
            <ReportButton postId={postId} />
          </div>
        </div>

        <h2 style={{fontFamily:'var(--font-sora)', fontSize:'1.15rem', fontWeight:'700', margin:'0 0 16px'}}>
          Comments {comments.length > 0 && `(${comments.length})`}
        </h2>

        <div style={{marginBottom:'24px'}}>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder='Share your thoughts...'
            rows={3}
            style={{width:'100%', background:'#0F172A', border:'1px solid #334155', borderRadius:'12px', padding:'14px', color:'white', fontSize:'0.95rem', outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:'1.6', marginBottom:'10px'}}
          />
          <button
            onClick={handleComment}
            disabled={submitting}
            style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', borderRadius:'999px', padding:'11px 24px', minHeight:'44px', color:'white', fontSize:'0.9rem', fontWeight:'600', cursor:'pointer'}}
          >
            {submitting ? 'Posting...' : 'Post comment'}
          </button>
        </div>

        {comments.length === 0 ? (
          <div style={{border:'1px dashed #334155', borderRadius:'14px', padding:'24px 16px', textAlign:'center', color:'#64748B', fontSize:'0.9rem'}}>
            No comments yet. Start the conversation.
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {comments.map((c, i) => (
              <div key={c.id || i} style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'12px', padding:'14px 16px'}}>
                {c.created_at && <p style={{color:'#64748B', fontSize:'0.75rem', margin:'0 0 6px'}}>{timeAgo(c.created_at)}</p>}
                <p style={{color:'#CBD5E1', fontSize:'0.92rem', lineHeight:'1.6', margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word'}}>{c.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}