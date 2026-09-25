'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Count = { total: number; claimed: number; left: number }

export default function FounderCounter({ compact = false }: { compact?: boolean }) {
  const [count, setCount] = useState<Count | null>(null)
  const [shown, setShown] = useState(0)
  const [flash, setFlash] = useState(false)
  const shownRef = useRef<number | null>(null)

  useEffect(() => {
    let alive = true
    function load() {
      fetch('/api/founders', { cache: 'no-store' })
        .then(r => r.json())
        .then(d => { if (alive && !d.error) setCount(d) })
        .catch(() => {})
    }
    load()
    const t = setInterval(() => { if (document.visibilityState === 'visible') load() }, 30000)
    return () => { alive = false; clearInterval(t) }
  }, [])

  // Count down: from 1,000 on first load, then from the last number on each new signup
  useEffect(() => {
    if (!count) return
    const target = count.left
    const firstLoad = shownRef.current === null
    const from = firstLoad ? count.total : (shownRef.current as number)

    // Nothing to animate, just show the number
    if (from === target) {
      shownRef.current = target
      setShown(target)
      return
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!firstLoad && target < from) {
      setFlash(true)
      setTimeout(() => setFlash(false), 1400)
    }
    if (reduce) {
      shownRef.current = target
      setShown(target)
      return
    }

    const start = performance.now()
    const dur = firstLoad ? 1200 : Math.min(1200, 250 + (from - target) * 120)
    let raf = 0
    function tick(now: number) {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      const val = Math.round(from + (target - from) * eased)
      shownRef.current = val
      setShown(val)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [count])

  if (!count) return null

  const pct = Math.min(100, (count.claimed / count.total) * 100)
  const full = count.left === 0

  return (
    <div className={'hk-founders' + (compact ? ' compact' : '')}>
      <style>{`
        .hk-founders { max-width: 460px; margin: 0 auto; text-align: center; }
        .hk-founders-num { display: inline-block; font-family: var(--font-bebas), 'Arial Narrow', sans-serif; font-size: 3rem; line-height: 1; color: var(--c1); letter-spacing: .02em; font-variant-numeric: tabular-nums; }
        .hk-founders.compact .hk-founders-num { font-size: 2rem; }
        [data-theme='night'] .hk-founders-num { text-shadow: 0 0 12px var(--c1), 0 0 24px var(--c1); }
        .hk-founders-num.flash { animation: hk-founder-flash 1.4s ease; }
        @keyframes hk-founder-flash {
          0% { transform: scale(1); }
          15% { transform: scale(1.25); color: var(--c3); }
          40% { transform: scale(1); }
          100% { transform: scale(1); }
        }
        [data-theme='night'] .hk-founders-num.flash { animation: hk-founder-flash-night 1.4s ease; }
        @keyframes hk-founder-flash-night {
          0% { transform: scale(1); }
          15% { transform: scale(1.25); color: #fff; text-shadow: 0 0 18px var(--c1), 0 0 40px var(--c1), 0 0 60px var(--c1); }
          40% { transform: scale(1); }
          100% { transform: scale(1); }
        }
        .hk-founders-label { font-weight: 700; font-size: .95rem; margin: 4px 0 10px; color: var(--text); }
        .hk-founders.compact .hk-founders-label { font-size: .85rem; }
        .hk-founders-bar { height: 14px; border: 2px solid var(--ink); border-radius: 999px; overflow: hidden; background: var(--surface-2); }
        [data-theme='night'] .hk-founders-bar { border-color: var(--c1); box-shadow: 0 0 10px -2px var(--c1); }
        .hk-founders-fill { height: 100%; background: linear-gradient(90deg, var(--c1), var(--c2), var(--c3), var(--c4), var(--c5)); transition: width 1.2s ease; }
        .hk-founders-note { font-size: .8rem; color: var(--muted); margin: 8px 0 0; }
        .hk-founders-joined { font-size: .78rem; font-weight: 700; color: var(--c4); margin: 6px 0 0; min-height: 1.2em; }
        @media (prefers-reduced-motion: reduce) {
          .hk-founders-num.flash { animation: none; }
          .hk-founders-fill { transition: none; }
        }
      `}</style>

      {full ? (
        <p className='hk-founders-label'>All {count.total.toLocaleString()} founding spots are taken. Thanks for building this with us.</p>
      ) : (
        <>
          <div className={'hk-founders-num' + (flash ? ' flash' : '')} aria-live='polite'>{shown.toLocaleString()}</div>
          <p className='hk-founders-label'>
            of {count.total.toLocaleString()} founding member spots left
          </p>
          <div className='hk-founders-bar' role='progressbar' aria-valuemin={0} aria-valuemax={count.total} aria-valuenow={count.claimed} aria-label='Founding spots claimed'>
            <div className='hk-founders-fill' style={{ width: pct + '%' }} />
          </div>
          <p className='hk-founders-joined' aria-hidden='true'>{flash ? 'Someone just claimed a spot' : ''}</p>
          {!compact && (
            <p className='hk-founders-note'>
              The first {count.total.toLocaleString()} people to verify their email get a numbered founding badge for good.{' '}
              <Link href='/auth/signup' style={{ color: 'var(--c5)', fontWeight: 700 }}>Claim yours</Link>
            </p>
          )}
        </>
      )}
    </div>
  )
}