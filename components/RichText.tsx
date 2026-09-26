import Link from 'next/link'
import { Fragment } from 'react'

// Shows text with @mentions linked to profiles and web links made clickable.
// Everything else is plain text, so nothing anyone types can run as code.
const PATTERN = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])|(^|[^a-zA-Z0-9_@])@([a-zA-Z0-9_]{3,20})(?![a-zA-Z0-9_])/g

export default function RichText({ text }: { text: string }) {
  if (!text) return null
  const parts: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  PATTERN.lastIndex = 0

  while ((m = PATTERN.exec(text)) !== null) {
    if (m[1]) {
      // Web link
      if (m.index > last) parts.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>)
      parts.push(
        <a key={key++} href={m[1]} target='_blank' rel='noopener noreferrer nofollow ugc' style={{ color: 'var(--c5)', fontWeight: 600, wordBreak: 'break-all' }}>
          {m[1]}
        </a>
      )
      last = m.index + m[1].length
    } else {
      // @mention (keep the character before the @)
      const lead = m[2] || ''
      const start = m.index + lead.length
      if (start > last) parts.push(<Fragment key={key++}>{text.slice(last, start)}</Fragment>)
      const name = m[3]
      parts.push(
        <Link key={key++} href={'/profile/' + name.toLowerCase()} style={{ color: 'var(--c5)', fontWeight: 700, textDecoration: 'none' }}>
          @{name}
        </Link>
      )
      last = start + 1 + name.length
    }
  }
  if (last < text.length) parts.push(<Fragment key={key++}>{text.slice(last)}</Fragment>)
  return <>{parts}</>
}