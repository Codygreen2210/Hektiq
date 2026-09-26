'use client'
import Link from 'next/link'
import { useState, useEffect, use, useMemo } from 'react'
import Header from '../../../../../components/Header'
import ReportButton from '../../../../../components/ReportButton'
import ShareButton from '../../../../../components/ShareButton'
import VideoEmbed from '../../../../../components/VideoEmbed'
import PhotoGallery from '../../../../../components/PhotoGallery'
import FounderChip from '../../../../../components/FounderChip'
import RichText from '../../../../../components/RichText'
import { seededBySlug } from '../../../../../lib/communities'
import { getAuthHeader } from '../../../../../lib/authToken'
import { CommunityIcon, UpIcon, DownIcon, CommentIcon } from '../../../../../components/Icons'
import { Trash, ArrowLeft, ArrowBendUpLeft, PushPin, ArrowFatUp, ArrowFatDown, PencilSimple } from '@phosphor-icons/react'

const COLOR: Record<string, string> = {
  'outdoors': '4',
  'sports': '5',
  'money-building': '3',
  'garage': '1',
  'art-makers': '2',
}

const MAX_INDENT = 5

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}

function Author({ author, date, edited, size = 30 }: { author: any; date: string; edited?: string | null; size?: number }) {
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
      <span style={{color:'var(--faint)'}}>· {timeAgo(date)}{edited ? ' · edited' : ''}</span>
    </div>
  )
}

type Ctx = {
  me: string | null
  isAdmin: boolean
  childrenOf: Record<string, any[]>
  replyingTo: string | null
  setReplyingTo: (id: string | null) => void
  replyText: string
  setReplyText: (t: string) => void
  replyError: string
  replying: boolean
  submitReply: (parentId: string) => void
  confirmComment: string | null
  setConfirmComment: (id: string | null) => void
  deletingComment: string | null
  handleDeleteComment: (id: string) => void
  collapsed: Record<string, boolean>
  toggleCollapse: (id: string) => void
  highlight: string | null
  commentVotes: Record<string, 'up' | 'down' | null>
  voteComment: (id: string, direction: 'up' | 'down') => void
  editingComment: string | null
  startEditComment: (c: any) => void
  cancelEditComment: () => void
  commentEditText: string
  setCommentEditText: (t: string) => void
  commentEditError: string
  savingCommentEdit: boolean
  saveCommentEdit: (id: string) => void
}

function countAll(id: string, childrenOf: Record<string, any[]>): number {
  const kids = childrenOf[id] || []
  return kids.reduce((n, k) => n + 1 + countAll(k.id, childrenOf), 0)
}

function CommentNode({ c, depth, ctx }: { c: any; depth: number; ctx: Ctx }) {
  const kids = ctx.childrenOf[c.id] || []
  const isCollapsed = !!ctx.collapsed[c.id]
  const isMine = !!ctx.me && c.author?.username === ctx.me
  const canDelete = !c.is_deleted && (isMine || ctx.isAdmin)
  const canEdit = !c.is_deleted && isMine
  const isReplying = ctx.replyingTo === c.id
  const isEditing = ctx.editingComment === c.id
  const indent = depth > 0 && depth <= MAX_INDENT
  const my = ctx.commentVotes[c.id] || null

  return (
    <div className={indent ? 'hk-thread' : ''} style={{marginLeft: indent ? 14 : 0}}>
      <div
        id={'c-' + c.id}
        className={'hk-card hk-comment' + (ctx.highlight === c.id ? ' hk-flash' : '')}
        style={{padding:'12px 14px', borderLeft: depth === 0 ? '4px solid var(--tube)' : undefined}}
      >
        {c.is_deleted ? (
          <p style={{margin:0, fontSize:'0.88rem', color:'var(--faint)', fontStyle:'italic'}}>comment deleted</p>
        ) : (
          <>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px', marginBottom:'6px'}}>
              <Author author={c.author} date={c.created_at} edited={c.edited_at} size={26} />
              <div style={{display:'flex', flexShrink:0}}>
                {canEdit && !isEditing && (
                  <button onClick={() => ctx.startEditComment(c)} aria-label='Edit comment' className='hk-trash'>
                    <PencilSimple size={17} weight='duotone' />
                  </button>
                )}
                {canDelete && ctx.confirmComment !== c.id && !isEditing && (
                  <button onClick={() => ctx.setConfirmComment(c.id)} aria-label='Delete comment' className='hk-trash'>
                    <Trash size={17} weight='duotone' />
                  </button>
                )}
              </div>
            </div>
            {isEditing ? (
              <div>
                <textarea
                  value={ctx.commentEditText}
                  onChange={e => ctx.setCommentEditText(e.target.value)}
                  rows={3}
                  maxLength={5000}
                  className='hk-input'
                  autoFocus
                  aria-label='Edit your comment'
                  style={{resize:'vertical', lineHeight:'1.6', marginBottom:'8px'}}
                />
                {ctx.commentEditError && <p style={{color:'var(--c1)', fontSize:'0.85rem', fontWeight:600, margin:'0 0 8px'}}>{ctx.commentEditError}</p>}
                <div style={{display:'flex', gap:'8px'}}>
                  <button onClick={() => ctx.saveCommentEdit(c.id)} disabled={ctx.savingCommentEdit || !ctx.commentEditText.trim()} className='hk-btn' style={{padding:'6px 16px', minHeight:'36px', fontSize:'0.85rem'}}>
                    {ctx.savingCommentEdit ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={ctx.cancelEditComment} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'36px', fontSize:'0.85rem'}}>Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{fontSize:'0.95rem', lineHeight:'1.65', margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word'}}><RichText text={c.body} /></p>
            )}
          </>
        )}

        <div style={{display:'flex', alignItems:'center', gap:'12px', marginTop:'8px', flexWrap:'wrap'}}>
          {!c.is_deleted && (
            <div className='hk-cvote'>
              <button onClick={() => ctx.voteComment(c.id, 'up')} aria-label='Upvote comment' className={my === 'up' ? 'on up' : ''}>
                <ArrowFatUp size={15} weight={my === 'up' ? 'fill' : 'bold'} />
              </button>
              <span style={{color: my === 'up' ? 'var(--c4)' : my === 'down' ? 'var(--c1)' : 'var(--muted)'}}>{c.score || 0}</span>
              <button onClick={() => ctx.voteComment(c.id, 'down')} aria-label='Downvote comment' className={my === 'down' ? 'on down' : ''}>
                <ArrowFatDown size={15} weight={my === 'down' ? 'fill' : 'bold'} />
              </button>
            </div>
          )}
          {!c.is_deleted && (
            ctx.me ? (
              <button
                className='hk-mini'
                onClick={() => { ctx.setReplyingTo(isReplying ? null : c.id); ctx.setReplyText('') }}
              >
                <ArrowBendUpLeft size={14} weight='bold' />
                {isReplying ? 'Cancel' : 'Reply'}
              </button>
            ) : (
              <Link href='/auth/login' className='hk-mini'>
                <ArrowBendUpLeft size={14} weight='bold' />
                Log in to reply
              </Link>
            )
          )}
          {kids.length > 0 && (
            <button className='hk-mini' onClick={() => ctx.toggleCollapse(c.id)}>
              {isCollapsed ? 'Show ' + countAll(c.id, ctx.childrenOf) + (countAll(c.id, ctx.childrenOf) === 1 ? ' reply' : ' replies') : 'Hide replies'}
            </button>
          )}
        </div>

        {ctx.confirmComment === c.id && (
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'10px', flexWrap:'wrap'}}>
            <span style={{fontSize:'0.85rem', color:'var(--c1)', fontWeight:700}}>Delete this comment?</span>
            <button onClick={() => ctx.handleDeleteComment(c.id)} disabled={ctx.deletingComment === c.id} className='hk-danger'>
              {ctx.deletingComment === c.id ? 'Deleting...' : 'Yes, delete'}
            </button>
            <button onClick={() => ctx.setConfirmComment(null)} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'36px', fontSize:'0.85rem'}}>Cancel</button>
          </div>
        )}

        {isReplying && (
          <div style={{marginTop:'10px'}}>
            <textarea
              value={ctx.replyText}
              onChange={e => ctx.setReplyText(e.target.value)}
              placeholder={'Reply to ' + (c.author?.username || 'this comment') + '...'}
              rows={3}
              maxLength={5000}
              className='hk-input'
              autoFocus
              style={{resize:'vertical', lineHeight:'1.6', marginBottom:'8px'}}
            />
            {ctx.replyError && <p style={{color:'var(--c1)', fontSize:'0.85rem', fontWeight:600, margin:'0 0 8px'}}>{ctx.replyError}</p>}
            <button onClick={() => ctx.submitReply(c.id)} disabled={ctx.replying || !ctx.replyText.trim()} className='hk-btn' style={{padding:'6px 16px', minHeight:'38px', fontSize:'0.88rem'}}>
              {ctx.replying ? 'Posting...' : 'Post reply'}
            </button>
          </div>
        )}
      </div>

      {kids.length > 0 && !isCollapsed && (
        <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'8px'}}>
          {kids.map(k => <CommentNode key={k.id} c={k} depth={depth + 1} ctx={ctx} />)}
        </div>
      )}
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyError, setReplyError] = useState('')
  const [replying, setReplying] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [highlight, setHighlight] = useState<string | null>(null)
  const [pinning, setPinning] = useState(false)
  const [commentVotes, setCommentVotes] = useState<Record<string, 'up' | 'down' | null>>({})
  const [commentSort, setCommentSort] = useState<'best' | 'new'>('best')

  const [editingPost, setEditingPost] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [savingPost, setSavingPost] = useState(false)
  const [postEditError, setPostEditError] = useState('')

  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [commentEditText, setCommentEditText] = useState('')
  const [commentEditError, setCommentEditError] = useState('')
  const [savingCommentEdit, setSavingCommentEdit] = useState(false)

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
        const res = await fetch('/api/posts/' + postId, { cache: 'no-store' })
        const data = await res.json()
        if (data.post) setPost(data.post)
      } catch (e) {
        console.error(e)
      }
      try {
        const auth = u ? await getAuthHeader() : {}
        const res = await fetch('/api/comments?post_id=' + postId, { headers: { ...auth }, cache: 'no-store' })
        const data = await res.json()
        if (data.comments) setComments(data.comments)
        if (data.myVotes) setCommentVotes(data.myVotes)
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

  // Jump to a comment from a notification link (#c-<id>)
  useEffect(() => {
    if (loading) return
    const hash = window.location.hash
    if (!hash.startsWith('#c-')) return
    const id = hash.slice(3)
    setTimeout(() => {
      const el = document.getElementById('c-' + id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlight(id)
        setTimeout(() => setHighlight(null), 2400)
      }
    }, 150)
  }, [loading])

  const { roots, childrenOf } = useMemo(() => {
    const ids = new Set(comments.map(c => c.id))
    const kids: Record<string, any[]> = {}
    const top: any[] = []
    for (const c of comments) {
      if (c.parent_id && ids.has(c.parent_id)) {
        if (!kids[c.parent_id]) kids[c.parent_id] = []
        kids[c.parent_id].push(c)
      } else {
        top.push(c)
      }
    }
    const order = (a: any, b: any) => {
      if (commentSort === 'best') {
        const d = (b.score || 0) - (a.score || 0)
        if (d !== 0) return d
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    top.sort(order)
    for (const k of Object.keys(kids)) kids[k].sort(order)
    return { roots: top, childrenOf: kids }
  }, [comments, commentSort])

  const liveCount = comments.filter(c => !c.is_deleted).length

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

  async function voteComment(id: string, direction: 'up' | 'down') {
    if (!me) {
      setVoteMsg('Log in to vote.')
      setTimeout(() => setVoteMsg(''), 2500)
      return
    }
    const prev = commentVotes[id] || null
    const prevComments = comments
    const next = prev === direction ? null : direction
    const delta = (next === 'up' ? 1 : next === 'down' ? -1 : 0) - (prev === 'up' ? 1 : prev === 'down' ? -1 : 0)
    setCommentVotes(v => ({ ...v, [id]: next }))
    setComments(cs => cs.map(c => c.id === id ? { ...c, score: (c.score || 0) + delta } : c))

    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/comments/' + id + '/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ direction })
      })
      const data = await res.json()
      if (data.error) {
        setCommentVotes(v => ({ ...v, [id]: prev }))
        setComments(prevComments)
        setVoteMsg(data.error)
        setTimeout(() => setVoteMsg(''), 3500)
      } else {
        setCommentVotes(v => ({ ...v, [id]: data.myVote }))
        setComments(cs => cs.map(c => c.id === id ? { ...c, score: data.score } : c))
      }
    } catch (e) {
      setCommentVotes(v => ({ ...v, [id]: prev }))
      setComments(prevComments)
    }
  }

  async function handlePin() {
    setPinning(true)
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/posts/' + postId + '/pin', { method: 'POST', headers: { ...auth } })
      const data = await res.json()
      if (data.error) {
        setVoteMsg(data.error)
        setTimeout(() => setVoteMsg(''), 3500)
      } else {
        setPost((p: any) => ({ ...p, is_pinned: !!data.pinned }))
      }
    } catch (e) {}
    setPinning(false)
  }

  function startEditPost() {
    setEditTitle(post.title || '')
    setEditBody(post.body || '')
    setPostEditError('')
    setEditingPost(true)
  }

  async function savePostEdit() {
    setSavingPost(true)
    setPostEditError('')
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/posts/' + postId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ title: editTitle, body: editBody })
      })
      const data = await res.json()
      if (data.error) setPostEditError(data.error)
      else {
        setPost((p: any) => ({ ...p, ...data.post }))
        setEditingPost(false)
      }
    } catch (e) {
      setPostEditError('Something went wrong. Try again.')
    }
    setSavingPost(false)
  }

  function startEditComment(c: any) {
    setEditingComment(c.id)
    setCommentEditText(c.body || '')
    setCommentEditError('')
    setConfirmComment(null)
  }

  async function saveCommentEdit(id: string) {
    setSavingCommentEdit(true)
    setCommentEditError('')
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/comments/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ body: commentEditText })
      })
      const data = await res.json()
      if (data.error) setCommentEditError(data.error)
      else {
        setComments(cs => cs.map(c => c.id === id ? { ...c, ...data.comment } : c))
        setEditingComment(null)
      }
    } catch (e) {
      setCommentEditError('Something went wrong. Try again.')
    }
    setSavingCommentEdit(false)
  }

  async function postComment(text: string, parentId: string | null) {
    const auth = await getAuthHeader()
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({ body: text, post_id: postId, parent_id: parentId })
    })
    return res.json()
  }

  async function handleComment() {
    if (!comment.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const data = await postComment(comment, null)
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

  async function submitReply(parentId: string) {
    if (!replyText.trim()) return
    setReplying(true)
    setReplyError('')
    try {
      const data = await postComment(replyText, parentId)
      if (data.error) setReplyError(data.error)
      else if (data.comment) {
        setComments(prev => [...prev, data.comment])
        setCollapsed(c => ({ ...c, [parentId]: false }))
        setReplyText('')
        setReplyingTo(null)
      }
    } catch (e) {
      setReplyError('Something went wrong. Try again.')
    }
    setReplying(false)
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
      if (!data.error) {
        const hasReplies = comments.some(c => c.parent_id === id)
        setComments(prev => hasReplies
          ? prev.map(c => c.id === id ? { ...c, is_deleted: true, body: '', author: null } : c)
          : prev.filter(c => c.id !== id))
      }
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

  const ctx: Ctx = {
    me, isAdmin, childrenOf,
    replyingTo, setReplyingTo: (id) => { setReplyingTo(id); setReplyError('') },
    replyText, setReplyText, replyError, replying, submitReply,
    confirmComment, setConfirmComment, deletingComment, handleDeleteComment,
    collapsed, toggleCollapse: (id) => setCollapsed(c => ({ ...c, [id]: !c[id] })),
    highlight,
    commentVotes, voteComment,
    editingComment, startEditComment, cancelEditComment: () => { setEditingComment(null); setCommentEditError('') },
    commentEditText, setCommentEditText, commentEditError, savingCommentEdit, saveCommentEdit,
  }

  return (
    <main className='hk-dots' style={{minHeight:'100vh', color:'var(--text)', overflowX:'hidden', ['--tube' as any]: accent}}>
      <style>{`
        .hk-post { border-top: 6px solid var(--tube); }
        [data-theme='night'] .hk-post { box-shadow: 0 -6px 18px -10px var(--tube); }
        .hk-comm-chip { display:inline-flex; align-items:center; gap:8px; padding:6px 12px; border-radius:6px; text-decoration:none; font-weight:700; font-size:0.85rem; border:2px solid var(--ink); background: var(--tube); color: var(--chip-on); transition: background-color .6s, color .6s; }
        [data-theme='night'] .hk-comm-chip { background: transparent; color: var(--tube); border-color: var(--tube); box-shadow: 0 0 8px var(--tube); }

        .hk-pinned { display:inline-flex; align-items:center; gap:5px; font-family: var(--font-bebas), sans-serif; font-size: 0.95rem; letter-spacing: .08em; color: var(--c4); margin: 0 0 6px; }
        [data-theme='night'] .hk-pinned { text-shadow: 0 0 8px var(--c4); }

        .hk-vbar { display:inline-flex; align-items:center; gap:4px; border:2px solid var(--border-soft); border-radius:8px; background:var(--surface-2); padding:2px 6px; }
        .hk-vote { background:none; border:none; cursor:pointer; padding:6px; display:flex; color:var(--faint); }
        .hk-vote.up.on { color: var(--c4); }
        .hk-vote.down.on { color: var(--c1); }
        [data-theme='night'] .hk-vote.on { filter: drop-shadow(0 0 6px currentColor); }

        .hk-cvote { display:inline-flex; align-items:center; gap:2px; font-size:0.82rem; font-weight:800; }
        .hk-cvote button { background:none; border:none; cursor:pointer; padding:6px 4px; min-height:32px; display:flex; align-items:center; color:var(--faint); }
        .hk-cvote button.on.up { color: var(--c4); }
        .hk-cvote button.on.down { color: var(--c1); }
        .hk-cvote span { min-width:14px; text-align:center; }

        .hk-csort { display:flex; gap:6px; }
        .hk-csort button { border-radius:6px; padding:6px 12px; min-height:34px; font-size:0.8rem; font-weight:700; cursor:pointer; border:2px solid var(--border-soft); background:transparent; color:var(--muted); }
        .hk-csort button.on { border-color: var(--border); color: var(--text); background: var(--surface-2); }

        .hk-trash { background:none; border:none; color:var(--faint); cursor:pointer; padding:6px; display:flex; flex-shrink:0; }
        .hk-trash:hover { color: var(--c1); }
        .hk-danger { display:inline-flex; align-items:center; background: var(--c1); color: var(--on-c1); border:2px solid var(--ink); border-radius:6px; padding:6px 14px; min-height:36px; font-size:0.85rem; font-weight:700; cursor:pointer; }

        .hk-thread { border-left: 2px solid var(--border-soft); padding-left: 10px; }
        [data-theme='night'] .hk-thread { border-left-color: color-mix(in srgb, var(--tube) 45%, transparent); }
        .hk-mini { display:inline-flex; align-items:center; gap:5px; background:none; border:none; padding:6px 2px; min-height:32px; font-size:0.8rem; font-weight:700; color:var(--muted); cursor:pointer; text-decoration:none; }
        .hk-mini:hover { color: var(--text); }
        @keyframes hkFlash { 0% { box-shadow: 0 0 0 3px var(--c3); } 100% { box-shadow: 0 0 0 0 transparent; } }
        .hk-flash { animation: hkFlash 2.2s ease-out; }
        @media (prefers-reduced-motion: reduce) { .hk-flash { animation: none; outline: 3px solid var(--c3); } }
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
            <Author author={post.author} date={post.created_at} edited={post.edited_at} />
          </div>

          {post.is_pinned && (
            <p className='hk-pinned'><PushPin size={15} weight='fill' /> PINNED</p>
          )}

          {editingPost ? (
            <div style={{margin:'0 0 16px'}}>
              <input
                value={editTitle}
                onChange={e => { setEditTitle(e.target.value); setPostEditError('') }}
                maxLength={300}
                className='hk-input'
                aria-label='Edit title'
                style={{fontSize:'1.1rem', fontWeight:700, marginBottom:'10px'}}
              />
              <textarea
                value={editBody}
                onChange={e => { setEditBody(e.target.value); setPostEditError('') }}
                rows={8}
                className='hk-input'
                aria-label='Edit text'
                style={{resize:'vertical', lineHeight:'1.7', marginBottom:'10px'}}
              />
              {postEditError && <p style={{color:'var(--c1)', fontSize:'0.88rem', fontWeight:600, margin:'0 0 10px'}}>{postEditError}</p>}
              <div style={{display:'flex', gap:'8px'}}>
                <button onClick={savePostEdit} disabled={savingPost} className='hk-btn'>
                  {savingPost ? 'Saving...' : 'Save changes'}
                </button>
                <button onClick={() => { setEditingPost(false); setPostEditError('') }} className='hk-btn-ghost'>Cancel</button>
              </div>
              <p style={{fontSize:'0.8rem', color:'var(--faint)', margin:'10px 0 0'}}>Photos and video links can't be changed. Delete and repost if you need to swap them.</p>
            </div>
          ) : (
            <h1 style={{fontSize:'1.6rem', fontWeight:800, lineHeight:'1.3', margin:'0 0 16px', wordBreak:'break-word'}}>{post.title}</h1>
          )}

          {Array.isArray(post.image_urls) && post.image_urls.length > 0 && <PhotoGallery urls={post.image_urls} />}

          {post.video_url && <VideoEmbed url={post.video_url} />}

          {post.body && !editingPost && (
            <p style={{color:'var(--text)', fontSize:'1.02rem', lineHeight:'1.8', margin:'0 0 20px', whiteSpace:'pre-wrap', wordBreak:'break-word'}}><RichText text={post.body} /></p>
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
              {liveCount} {liveCount === 1 ? 'comment' : 'comments'}
            </span>
            <ShareButton path={'/c/' + slug + '/post/' + postId} title={post.title} />

            <div style={{marginLeft:'auto', display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap'}}>
              {isOwner && !editingPost && (
                <button onClick={startEditPost} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'36px', fontSize:'0.85rem'}}>
                  <PencilSimple size={15} weight='duotone' aria-hidden='true' />
                  Edit
                </button>
              )}
              {isAdmin && (
                <button onClick={handlePin} disabled={pinning} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'36px', fontSize:'0.85rem'}}>
                  <PushPin size={15} weight={post.is_pinned ? 'fill' : 'duotone'} aria-hidden='true' />
                  {pinning ? '...' : post.is_pinned ? 'Unpin' : 'Pin'}
                </button>
              )}
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

        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px', flexWrap:'wrap', margin:'32px 0 14px'}}>
          <h2 className='font-display' style={{fontSize:'1.6rem', margin:0}}>COMMENTS</h2>
          {liveCount > 1 && (
            <div className='hk-csort' role='tablist' aria-label='Sort comments'>
              <button role='tab' aria-selected={commentSort === 'best'} className={commentSort === 'best' ? 'on' : ''} onClick={() => setCommentSort('best')}>Best</button>
              <button role='tab' aria-selected={commentSort === 'new'} className={commentSort === 'new' ? 'on' : ''} onClick={() => setCommentSort('new')}>New</button>
            </div>
          )}
        </div>

        {me ? (
          <div style={{marginBottom:'24px'}}>
            <textarea
              value={comment}
              onChange={e => { setComment(e.target.value); setError('') }}
              placeholder='Share your thoughts... (type @name to tag someone)'
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

        {roots.length === 0 ? (
          <div className='hk-card' style={{padding:'24px 16px', textAlign:'center', color:'var(--muted)', borderStyle:'dashed'}}>
            No comments yet. Start the conversation.
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {roots.map(c => <CommentNode key={c.id} c={c} depth={0} ctx={ctx} />)}
          </div>
        )}
      </div>
    </main>
  )
}