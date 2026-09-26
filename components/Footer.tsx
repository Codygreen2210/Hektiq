'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname() || '/'

  // Community pages have a fixed bottom nav, so leave room for it
  const hasBottomNav = /^\/c\/[^/]+$/.test(pathname)

  const link = { color: 'var(--muted)', textDecoration: 'none', fontWeight: 600 }

  return (
    <footer
      style={{
        borderTop: '2px solid var(--border-soft)',
        padding: hasBottomNav ? '24px 16px 110px' : '24px 16px 90px',
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: '0.85rem',
        background: 'var(--bg)',
      }}
    >
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '18px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <Link href='/communities' style={link}>Communities</Link>
        <Link href='/trending' style={link}>Trending</Link>
        <Link href='/terms' style={link}>Terms</Link>
        <Link href='/privacy' style={link}>Privacy</Link>
      </nav>
      <p style={{ margin: 0, color: 'var(--faint)' }}>Hektiq 2026. Built by the community.</p>
    </footer>
  )
}