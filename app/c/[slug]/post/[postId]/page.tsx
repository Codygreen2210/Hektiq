'use client'
import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import Header from '../../../../../components/Header'
import ReportButton from '../../../../../components/ReportButton'
import { seededBySlug } from '../../../../../lib/communities'
import { getAuthHeader } from '../../../../../lib/authToken'
import { CommunityIcon } from '../../../../../components/Icons'
import { Trash } from '@phosphor-icons/react'

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}

function Author({ author, date, size = 28 }: { author: any; date: string; size?: number }) {
  const name = author?.username
  const avatar = name ? (
    author.avatar_url ? (
      <img src={author.avatar_url} alt='' style={{width:size, height:size, borderRadius:'50%', objectFit:'cover'}} />
    ) : (
      <div style={{width:size, height:size, borderRadius:'50%', background:'linear-gradient(135deg, #8B5CF6, #06B6D4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size * 0.42, fontWeight:'700', color:'white'}}>
        {name.charAt(0).toUpperCase()}
      </div>
    )
  ) : (
    <div style={{width:size, height:size, borderRadius:'50%', background:'#1E293B'}} />
  )

  return (
    <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.82rem'}}>
      {name ? <Link href={'/profile/' + name} style={{display:'flex'}}>{avatar}</Link> : avatar}
      {name ? (
        <Link href={'/profile/' + name} style={{color:'#E2E8F0', fontWeight:'600', textDecoration:'none'}}>{name}</Link>
      ) : (
        <span style={{color:'#64748B'}}>unknown</span>
      )}
      <span style={{color:'#64748B'}}>· {timeAgo(date)}</span>
    </div>
  )
}

export default function PostPage({ params }: { params: Promise<{ slug: string; postId: string }> }) {
  const { slug, postId } = use(params)
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [me, setMe] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const community = seededBySlug[slug]

  useEffect(() => {
    const u = localStorage.getItem('hektiq_username')
    setMe(u)
    if (u) {
      fetch('/api/profile/' + u)
        .then(r => r.json())
        .then(d => setIsAdmin(!!d.profile?.is_admin))
        .catch(() => {})
    }

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
    setError('')
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ body: comment, post_id: postId })
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else if (data.comment) {
        setComments(prev => [...prev, data.comment])
        setComment('')
      }
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setSubmitting(false)
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/posts/' + postId, { method: 'DELETE', headers: { ...auth } })
      const data = await res.json()
      if (data.error) {
        setDeleteError(data.error)
        setDeleting(false)
      } else {
        window.location.href = '/c/' + slug
      }
    } catch (e) {
      setDeleteError('Something went wrong. Try again.')
      setDeleting(false)
    }
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

  const isOwner = !!me && post.author?.username === me
  const canDelete = isOwner || isAdmin

  return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white', overflowX:'hidden'}}>
      <Header />

      <div style={{maxWidth:'720px', margin:'0 auto', padding:'24px 16px 48px'}}>
        <Link href={'/c/' + slug} style={{display:'inline-flex', alignItems:'center', gap:'8px', color: community ? community.accent : '#A78BFA', textDecoration:'none', fontSize:'0.85rem', fontWeight:'600', marginBottom:'16px'}}>
          <CommunityIcon slug={slug} size={18} />
          {community ? community.name : slug}
        </Link>

        <div style={{marginBottom:'12px'}}>
          <Author author={post.author} date={post.created_at} />
        </div>

        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'1.6rem', fontWeight:'700', color:'white', lineHeight:'1.3', margin:'0 0 16px', wordBreak:'break-word'}}>{post.title}</h1>
        <p style={{color:'#CBD5E1', fontSize:'1rem', lineHeight:'1.8', margin:'0 0 24px', whiteSpace:'pre-wrap', wordBreak:'break-word'}}>{post.body}</p>

        <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', paddingBottom:'24px', borderBottom:'1px solid #1E293B', marginBottom:'28px'}}>
          <span style={{fontSize:'0.85rem', color:'#94A3B8'}}>▲ {post.upvotes || 0}</span>
          <span style={{fontSize:'0.85rem', color:'#94A3B8'}}>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
          <div style={{marginLeft:'auto', display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap'}}>
            {canDelete && !confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{display:'inline-flex', alignItems:'center', gap:'6px', background:'transparent', border:'1px solid #334155', color:'#94A3B8', borderRadius:'999px', padding:'7px 14px', fontSize:'0.8rem', cursor:'pointer', minHeight:'36px'}}
              >
                <Trash size={15} weight='duotone' aria-hidden='true' />
                Delete
              </button>
            )}
            {canDelete && confirmDelete && (
              <>
                <span style={{fontSize:'0.8rem', color:'#FCA5A5'}}>Delete this post?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{background:'#DC2626', border:'none', color:'white', borderRadius:'999px', padding:'7px 14px', fontSize:'0.8rem', fontWeight:'600', cursor:'pointer', minHeight:'36px'}}
                >
                  {deleting ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{background:'transparent', border:'1px solid #334155', color:'#94A3B8', borderRadius:'999px', padding:'7px 14px', fontSize:'0.8rem', cursor:'pointer', minHeight:'36px'}}
                >
                  Cancel
                </button>
              </>
            )}
            {!isOwner && <ReportButton postId={postId} />}
          </div>
        </div>
        {deleteError && <p style={{color:'#FCA5A5', fontSize:'0.85rem', margin:'-16px 0 20px'}}>{deleteError}</p>}

        {me ? (
          <div style={{marginBottom:'24px'}}>
            <textarea
              value={comment}
              onChange={e => { setComment(e.target.value); setError('') }}
              placeholder='Share your thoughts...'
              rows={3}
              maxLength={5000}
              style={{width:'100%', background:'#0F172A', border:'1px solid #334155', borderRadius:'12px', padding:'14px', color:'white', fontSize:'0.95rem', outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:'1.6', marginBottom:'10px'}}
            />
            {error && <p style={{color:'#FCA5A5', fontSize:'0.85rem', margin:'0 0 10px'}}>{error}</p>}
            <button
              onClick={handleComment}
              disabled={submitting}
              style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', borderRadius:'999px', padding:'11px 24px', minHeight:'44px', color:'white', fontSize:'0.9rem', fontWeight:'600', cursor:'pointer'}}
            >
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        ) : (
          <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'12px', padding:'16px', marginBottom:'24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap'}}>
            <span style={{color:'#CBD5E1', fontSize:'0.9rem'}}>Log in to join the conversation.</span>
            <Link href='/auth/login' style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', color:'white', borderRadius:'999px', padding:'9px 20px', textDecoration:'none', fontWeight:'600', fontSize:'0.85rem'}}>Log in</Link>
          </div>
        )}

        {comments.length === 0 ? (
          <div style={{border:'1px dashed #334155', borderRadius:'14px', padding:'24px 16px', textAlign:'center', color:'#64748B', fontSize:'0.9rem'}}>
            No comments yet. Start the conversation.
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {comments.map((c, i) => (
              <div key={c.id || i} style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'12px', padding:'14px 16px'}}>
                <div style={{marginBottom:'8px'}}>
                  <Author author={c.author} date={c.created_at} size={24} />
                </div>
                <p style={{color:'#CBD5E1', fontSize:'0.92rem', lineHeight:'1.6', margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word'}}>{c.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}