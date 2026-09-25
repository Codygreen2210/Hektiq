'use client'
import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import Header from '../../../../../components/Header'
import ReportButton from '../../../../../components/ReportButton'
import VideoEmbed from '../../../../../components/VideoEmbed'
import PhotoGallery from '../../../../../components/PhotoGallery'
import FounderChip from '../../../../../components/FounderChip'
import { seededBySlug } from '../../../../../lib/communities'
import { getAuthHeader } from '../../../../../lib/authToken'
import { CommunityIcon, UpIcon, DownIcon, CommentIcon } from '../../../../../components/Icons'
import { Trash, ArrowLeft } from '@phosphor-icons/react'

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

function Author({ author, date, size = 30 }: { author: any; date: string; size?: number }) {
  const name = author?.username
  const avatar = name ? (
    author.avatar_url ? (
      <img src={author.avatar_url} alt='' style={{width:size, height:size, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--border)'}} />
    ) : (
      <div style={{width:size, height:size, borderRadius:'50%', background:'var(--c2)', color:'var(--on-c2)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size * 0.42, fontWeight:800}}>
        {name.charAt(0).toUpperCase()}
      </div>
    )
  ) : (
    <div style={{width:size, height:size, borderRadius:'50%', background:'var(--surface-2)', border:'2px solid var(--border-soft)'}} />
  )

  return (
    <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', minWidth:0, flexWrap:'wrap'}}>
      {name ? <Link href={'/profile/' + name} style={{display:'flex'}}>{avatar}</Link> : avatar}
      {name ? (
        <Link href={'/profile/' + name} style={{color:'var(--text)', fontWeight:700, textDecoration:'none'}}>{name}</Link>
      ) : (
        <span style={{color:'var(--faint)', fontStyle:'italic'}}>deleted account</span>
      )}
      {name && <FounderChip number={author?.founder_number} />}
      <span style={{color:'var(--faint)'}}>· {timeAgo(date)}</span>
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
  const [confirmComment, setConfirmComment] = useState<string | null>(null)
  const [deletingComment, setDeletingComment] = useState<string | null>(null)
  const [myVote, setMyVote] = useState<'up' | 'down' | null>(null)
  const [voteMsg, setVoteMsg] = useState('')
  const [pop, setPop] = useState<'' | 'up' | 'down'>('')

  const community = seededBySlug[slug]
  const n = COLOR[slug] || '2'
  const accent = `var(--c${n})`

  useEffect(() => {
    const u = localStorage.getItem('hektiq_username')
    setMe(u)
    if (u) {
      fetch('/api/profile/' + u, { cache: 'no-store' })
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
      if (u) {
        try {
          const auth = await getAuthHeader()
          const vr = await fetch('/api/posts/my-votes?ids=' + postId, { headers: { ...auth } })
          const vd = await vr.json()
          setMyVote(vd.votes?.[postId] || null)
        } catch (e) {}
      }
      setLoading(false)
    }
    load()
  }, [postId])

  async function handleVote(direction: 'up' | 'down') {
    if (!me) {
      setVoteMsg('Log in to vote.')
      setTimeout(() => setVoteMsg(''), 2500)
      return
    }
    setPop(direction)
    setTimeout(() => setPop(''), 300)

    const prevVote = myVote
    const prevScore = post.upvotes || 0
    const nextVote = prevVote === direction ? null : direction
    const delta = (nextVote === 'up' ? 1 : nextVote === 'down' ? -1 : 0) - (prevVote === 'up' ? 1 : prevVote === 'down' ? -1 : 0)
    setMyVote(nextVote)
    setPost((p: any) => ({ ...p, upvotes: prevScore + delta }))

    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/posts/' + postId + '/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ direction })
      })
      const data = await res.json()
      if (data.error) {
        setMyVote(prevVote)
        setPost((p: any) => ({ ...p, upvotes: prevScore }))
        setVoteMsg(data.error)
        setTimeout(() => setVoteMsg(''), 3500)
      } else {
        setMyVote(data.myVote)
        setPost((p: any) => ({ ...p, upvotes: data.upvotes }))
      }
    } catch (e) {
      setMyVote(prevVote)
      setPost((p: any) => ({ ...p, upvotes: prevScore }))
    }
  }

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

  async function handleDeleteComment(id: string) {
    setDeletingComment(id)
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/comments/' + id, { method: 'DELETE', headers: { ...auth } })
      const data = await res.json()
      if (!data.error) setComments(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      console.error(e)
    }
    setDeletingComment(null)
    setConfirmComment(null)
  }

  if (loading) return (
    <main style={{minHeight:'100vh', color:'var(--text)'}}>
      <Header />
      <p style={{color:'var(--muted)', textAlign:'center', padding:'64px 16px'}}>Loading...</p>
    </main>
  )

  if (!post) return (
    <main style={{minHeight:'100vh', color:'var(--text)'}}>
      <Header />
      <div style={{textAlign:'center', padding:'64px 16px'}}>
        <h1 className='font-display' style={{fontSize:'2.4rem', marginBottom:'16px'}}>POST NOT FOUND</h1>
        <Link href={'/c/' + slug} className='hk-btn'>Back to community</Link>
      </div>
    </main>
  )

  const isOwner = !!me && post.author?.username === me
  const canDelete = isOwner || isAdmin

  return (
    <main className='hk-dots' style={{minHeight:'100vh', color:'var(--text)', overflowX:'hidden', ['--tube' as any]: accent}}>
      <style>{`
        .hk-post { border-top: 6px solid var(--tube); }
        [data-theme='night'] .hk-post { box-shadow: 0 -6px 18px -10px var(--tube); }
        .hk-comm-chip { display:inline-flex; align-items:center; gap:8px; padding:6px 12px; border-radius:6px; text-decoration:none; font-weight:700; font-size:0.85rem; border:2px solid var(--ink); background: var(--tube); color: var(--chip-on); transition: background-color .6s, color .6s; }
        [data-theme='night'] .hk-comm-chip { background: transparent; color: var(--tube); border-color: var(--tube); box-shadow: 0 0 8px var(--tube); }

        .hk-vbar { display:inline-flex; align-items:center; gap:4px; border:2px solid var(--border-soft); border-radius:8px; background:var(--surface-2); padding:2px 6px; }
        .hk-vote { background:none; border:none; cursor:pointer; padding:6px; display:flex; color:var(--faint); }
        .hk-vote.up.on { color: var(--c4); }
        .hk-vote.down.on { color: var(--c1); }
        [data-theme='night'] .hk-vote.on { filter: drop-shadow(0 0 6px currentColor); }

        .hk-trash { background:none; border:none; color:var(--faint); cursor:pointer; padding:6px; display:flex; flex-shrink:0; }
        .hk-trash:hover { color: var(--c1); }
        .hk-danger { display:inline-flex; align-items:center; background: var(--c1); color: var(--on-c1); border:2px solid var(--ink); border-radius:6px; padding:6px 14px; min-height:36px; font-size:0.85rem; font-weight:700; cursor:pointer; }
      `}</style>

      <Header />

      <div style={{maxWidth:'740px', margin:'0 auto', padding:'20px 16px 56px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px', flexWrap:'wrap'}}>
          <Link href={'/c/' + slug} aria-label='Back' style={{display:'flex', color:'var(--muted)', padding:'6px'}}>
            <ArrowLeft size={20} weight='bold' />
          </Link>
          <Link href={'/c/' + slug} className='hk-comm-chip' style={{['--chip-on' as any]: `var(--on-c${n})`}}>
            <CommunityIcon slug={slug} size={18} />
            {community ? community.name : slug}
          </Link>
        </div>

        <article className='hk-card hk-post' style={{padding:'20px'}}>
          <div style={{marginBottom:'12px'}}>
            <Author author={post.author} date={post.created_at} />
          </div>

          <h1 style={{fontSize:'1.6rem', fontWeight:800, lineHeight:'1.3', margin:'0 0 16px', wordBreak:'break-word'}}>{post.title}</h1>

          {Array.isArray(post.image_urls) && post.image_urls.length > 0 && <PhotoGallery urls={post.image_urls} />}

          {post.video_url && <VideoEmbed url={post.video_url} />}

          {post.body && (
            <p style={{color:'var(--text)', fontSize:'1.02rem', lineHeight:'1.8', margin:'0 0 20px', whiteSpace:'pre-wrap', wordBreak:'break-word'}}>{post.body}</p>
          )}

          <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', paddingTop:'14px', borderTop:'2px solid var(--border-soft)'}}>
            <div className='hk-vbar'>
              <button onClick={() => handleVote('up')} aria-label='Upvote' className={'hk-vote up' + (myVote === 'up' ? ' on' : '') + (pop === 'up' ? ' hk-pop' : '')}>
                <UpIcon size={20} active={myVote === 'up'} />
              </button>
              <span style={{fontWeight:800, minWidth:'20px', textAlign:'center', color: myVote === 'up' ? 'var(--c4)' : myVote === 'down' ? 'var(--c1)' : 'var(--text)'}}>{post.upvotes || 0}</span>
              <button onClick={() => handleVote('down')} aria-label='Downvote' className={'hk-vote down' + (myVote === 'down' ? ' on' : '') + (pop === 'down' ? ' hk-pop' : '')}>
                <DownIcon size={20} active={myVote === 'down'} />
              </button>
            </div>
            <span style={{display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'0.88rem', color:'var(--muted)', fontWeight:600}}>
              <CommentIcon size={16} />
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </span>

            <div style={{marginLeft:'auto', display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap'}}>
              {canDelete && !confirmDelete && (
                <button onClick={() => setConfirmDelete(true)} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'36px', fontSize:'0.85rem'}}>
                  <Trash size={15} weight='duotone' aria-hidden='true' />
                  Delete
                </button>
              )}
              {canDelete && confirmDelete && (
                <>
                  <span style={{fontSize:'0.85rem', color:'var(--c1)', fontWeight:700}}>Delete this post?</span>
                  <button onClick={handleDelete} disabled={deleting} className='hk-danger'>
                    {deleting ? 'Deleting...' : 'Yes, delete'}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'36px', fontSize:'0.85rem'}}>Cancel</button>
                </>
              )}
              {!isOwner && <ReportButton postId={postId} />}
            </div>
          </div>
          {voteMsg && (
            <p style={{fontSize:'0.88rem', margin:'10px 0 0', color:'var(--muted)'}}>
              {voteMsg}{voteMsg === 'Log in to vote.' && <> <Link href='/auth/login' style={{color:'var(--c5)', fontWeight:700}}>Log in</Link></>}
            </p>
          )}
          {deleteError && <p style={{color:'var(--c1)', fontSize:'0.88rem', fontWeight:600, margin:'10px 0 0'}}>{deleteError}</p>}
        </article>

        <h2 className='font-display' style={{fontSize:'1.6rem', margin:'32px 0 14px'}}>COMMENTS</h2>

        {me ? (
          <div style={{marginBottom:'24px'}}>
            <textarea
              value={comment}
              onChange={e => { setComment(e.target.value); setError('') }}
              placeholder='Share your thoughts...'
              rows={3}
              maxLength={5000}
              className='hk-input'
              style={{resize:'vertical', lineHeight:'1.6', marginBottom:'10px'}}
            />
            {error && <p style={{color:'var(--c1)', fontSize:'0.88rem', fontWeight:600, margin:'0 0 10px'}}>{error}</p>}
            <button onClick={handleComment} disabled={submitting} className='hk-btn'>
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        ) : (
          <div className='hk-card' style={{padding:'16px', marginBottom:'24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap'}}>
            <span style={{fontSize:'0.95rem'}}>Log in to join the conversation.</span>
            <Link href='/auth/login' className='hk-btn' style={{padding:'8px 18px', minHeight:'40px'}}>Log in</Link>
          </div>
        )}

        {comments.length === 0 ? (
          <div className='hk-card' style={{padding:'24px 16px', textAlign:'center', color:'var(--muted)', borderStyle:'dashed'}}>
            No comments yet. Start the conversation.
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {comments.map((c, i) => {
              const canDeleteComment = (!!me && c.author?.username === me) || isAdmin
              return (
                <div key={c.id || i} className='hk-card' style={{padding:'14px 16px', borderLeft:'4px solid var(--tube)'}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px', marginBottom:'8px'}}>
                    <Author author={c.author} date={c.created_at} size={26} />
                    {canDeleteComment && c.id && confirmComment !== c.id && (
                      <button onClick={() => setConfirmComment(c.id)} aria-label='Delete comment' className='hk-trash'>
                        <Trash size={17} weight='duotone' />
                      </button>
                    )}
                  </div>
                  <p style={{fontSize:'0.95rem', lineHeight:'1.65', margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word'}}>{c.body}</p>
                  {confirmComment === c.id && (
                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'12px', flexWrap:'wrap'}}>
                      <span style={{fontSize:'0.85rem', color:'var(--c1)', fontWeight:700}}>Delete this comment?</span>
                      <button onClick={() => handleDeleteComment(c.id)} disabled={deletingComment === c.id} className='hk-danger'>
                        {deletingComment === c.id ? 'Deleting...' : 'Yes, delete'}
                      </button>
                      <button onClick={() => setConfirmComment(null)} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'36px', fontSize:'0.85rem'}}>Cancel</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}