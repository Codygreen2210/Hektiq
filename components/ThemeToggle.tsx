'use client'
import { useEffect, useState } from 'react'
import { Sun, Moon } from '@phosphor-icons/react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'day' | 'night'>('day')

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    setTheme(current === 'night' ? 'night' : 'day')
  }, [])

  function toggle() {
    const next = theme === 'night' ? 'day' : 'night'
    const root = document.documentElement

    window.dispatchEvent(new CustomEvent('hektiq-theme-start', { detail: next }))

    const apply = () => {
      root.setAttribute('data-theme', next)
      try { localStorage.setItem('hektiq_theme', next) } catch (e) {}
      setTheme(next)
      window.dispatchEvent(new CustomEvent('hektiq-theme', { detail: next }))
    }

    if (next === 'day') setTimeout(apply, 350)
    else apply()
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
      title={theme === 'night' ? 'Day mode' : 'Night mode'}
      style={{
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        border: '2px solid var(--border-soft)',
        background: 'var(--surface)',
        color: theme === 'night' ? 'var(--c3)' : 'var(--c1)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'color 0.4s ease, border-color 0.2s ease'
      }}
    >
      {theme === 'night' ? <Sun size={20} weight='fill' /> : <Moon size={20} weight='fill' />}
    </button>
  )
}