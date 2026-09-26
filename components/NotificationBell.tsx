'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, ArrowFatUp, ChatCircle, ArrowBendUpLeft } from '@phosphor-icons/react'
import { getAuthHeader } from '../lib/authToken'
import FounderChip from './FounderChip'

type Note = {
  id: string
  type: 'upvote' | 'comment' | 'reply'
  read: boolean
  created_at: string
  actor: { username: string; avatar_url: string | null; founder_number: number | null } | null
  post_title: string
  link: string
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  return Math.floor(s / 86400) + 'd'
}

function short(t: string, n = 48) {
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t
}

export default function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState<Note[] | null>(null)
  const [loading, setLoading] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  async function load(markRead: boolean) {
    try {
      const auth = await getAuthHeader()
      const r = await fetch('/api/notifications', { headers: { ...auth }, cache: 'no-store' })
      const d = await r.json()
      if (d.error) return
      setNotes(d.notifications || [])
      setUnread(markRead ? 0 : (d.unread || 0))
      if (markRead && d.unread > 0) {
        fetch('/api/notifications', { method: 'POST', headers: { ...auth } }).catch(() => {})
      }
    } catch (e) {}
  }

  // Check for new ones every minute while the tab is showing
  useEffect(() => {
    load(false)
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(false) }, 60000)
    function onFocus() { load(false) }
    window.addEventListener('focus', onFocus)
    return () => { clearInterval(t); window.removeEventListener('focus', onFocus) }
  }, [])

  // Close on outside tap or Escape
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent | TouchEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      await load(true)
      setLoading(false)
    }
  }

  function line(n: Note) {
    const who = n.actor ? n.actor.username : 'Someone'
    if (n.type === 'upvote') return { who, what: 'upvoted your post', Icon: ArrowFatUp, color: 'var(--c4)' }
    if (n.type === 'comment') return { who, what: 'commented on your post', Icon: ChatCircle, color: 'var(--c5)' }
    return { who, what: 'replied to your comment on', Icon: ArrowBendUpLeft, color: 'var(--c2)' }
  }

  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      <style>{`
        .hk-bell { position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: none; border: none; color: var(--muted); cursor: pointer; }
        .hk-bell:hover { color: var(--text); }
        .hk-bell-count { position: absolute; top: 2px; right: 0; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: var(--c1); color: #fff; border: 2px solid var(--bg); font-size: .68rem; font-weight: 800; line-height: 14px; text-align: center; box-sizing: border-box; }
        [data-theme='night'] .hk-bell-count { box-shadow: 0 0 8px var(--c1); }
        .hk-notes { position: absolute; top: calc(100% + 10px); right: -54px; width: min(360px, calc(100vw - 24px)); max-height: 70vh; overflow-y: auto; background: var(--bg); border: 2px solid var(--ink); border-radius: 10px; box-shadow: var(--shadow-hard); z-index: 50; }
        [data-theme='night'] .hk-notes { border-color: var(--c5); box-shadow: 0 0 16px -2px var(--c5); }
        .hk-notes-head { padding: 12px 14px 10px; border-bottom: 2px solid var(--border-soft); font-family: var(--font-bebas), sans-serif; font-size: 1.3rem; letter-spacing: .04em; }
        .hk-note { display: flex; gap: 10px; padding: 12px 14px; text-decoration: none; color: var(--text); border-bottom: 1px solid var(--border-soft); align-items: flex-start; }
        .hk-note:hover { background: var(--surface-2); }
        .hk-note.new { background: var(--surface-2); }
        .hk-note-icon { flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--surface); border: 2px solid var(--border-soft); }
        .hk-note-text { font-size: .88rem; line-height: 1.45; min-width: 0; }
        .hk-note-time { font-size: .75rem; color: var(--faint); margin-top: 3px; }
        .hk-notes-empty { padding: 28px 16px; text-align: center; color: var(--muted); font-size: .9rem; }
      `}</style>

      <button
        className='hk-bell'
        onClick={toggle}
        aria-label={unread > 0 ? 'Notifications, ' + unread + ' new' : 'Notifications'}
        aria-haspopup='true'
        aria-expanded={open}
      >
        <Bell size={22} weight={unread > 0 ? 'fill' : 'bold'} />
        {unread > 0 && <span className='hk-bell-count'>{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className='hk-notes' role='dialog' aria-label='Notifications'>
          <div className='hk-notes-head'>NOTIFICATIONS</div>

          {loading && !notes ? (
            <div className='hk-notes-empty'>Loading...</div>
          ) : !notes || notes.length === 0 ? (
            <div className='hk-notes-empty'>Nothing yet. When someone upvotes, comments, or replies to you, it shows up here.</div>
          ) : (
            notes.map(n => {
              const { who, what, Icon, color } = line(n)
              return (
                <Link key={n.id} href={n.link} className={'hk-note' + (n.read ? '' : ' new')} onClick={() => setOpen(false)}>
                  <span className='hk-note-icon' style={{ color }}><Icon size={16} weight='bold' /></span>
                  <span className='hk-note-text'>
                    <strong>{who}</strong>{' '}
                    {n.actor && <FounderChip number={n.actor.founder_number} />}{' '}
                    {what} <strong>“{short(n.post_title)}”</strong>
                    <span className='hk-note-time' style={{ display: 'block' }}>{timeAgo(n.created_at)}</span>
                  </span>
                </Link>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}