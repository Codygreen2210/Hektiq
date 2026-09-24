'use client'
import { useEffect, useRef, useState } from 'react'
import { X } from '@phosphor-icons/react'

export default function PhotoGallery({ urls }: { urls: string[] }) {
  const [index, setIndex] = useState(0)
  const [full, setFull] = useState<number | null>(null)
  const strip = useRef<HTMLDivElement>(null)
  const fullStrip = useRef<HTMLDivElement>(null)

  // Track which photo is showing in the strip
  function onScroll() {
    const el = strip.current
    if (!el) return
    setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  // Full screen: jump to the tapped photo, lock page scroll, Escape closes
  useEffect(() => {
    if (full === null) return
    const el = fullStrip.current
    if (el) el.scrollLeft = full * el.clientWidth
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFull(null) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [full])

  if (!urls || urls.length === 0) return null

  return (
    <div style={{ margin: '0 0 18px' }}>
      <style>{`
        .hk-gal { position: relative; border: 2px solid var(--ink); border-radius: 10px; overflow: hidden; background: #0B0B0B; box-shadow: var(--shadow-hard); }
        [data-theme='night'] .hk-gal { border-color: var(--tube, var(--c1)); box-shadow: 0 0 14px var(--tube, var(--c1)); }
        .hk-gal-strip { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
        .hk-gal-strip::-webkit-scrollbar { display: none; }
        .hk-gal-strip button { flex: 0 0 100%; scroll-snap-align: start; border: none; padding: 0; background: none; cursor: zoom-in; display: flex; align-items: center; justify-content: center; max-height: 70vh; }
        .hk-gal-strip img { width: 100%; max-height: 70vh; object-fit: contain; display: block; }
        .hk-gal-count { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,.72); color: #fff; font-size: .78rem; font-weight: 700; padding: 4px 9px; border-radius: 5px; pointer-events: none; }
        .hk-gal-dots { display: flex; justify-content: center; gap: 6px; margin-top: 8px; }
        .hk-gal-dots span { width: 7px; height: 7px; border-radius: 50%; background: var(--border-soft); }
        .hk-gal-dots span.on { background: var(--tube, var(--c1)); }
        .hk-full { position: fixed; inset: 0; background: rgba(0,0,0,.95); z-index: 60; }
        .hk-full-strip { display: flex; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
        .hk-full-strip::-webkit-scrollbar { display: none; }
        .hk-full-strip div { flex: 0 0 100%; scroll-snap-align: start; display: flex; align-items: center; justify-content: center; }
        .hk-full-strip img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .hk-full-x { position: absolute; top: 14px; right: 14px; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,.15); color: #fff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 61; }
      `}</style>

      <div className='hk-gal'>
        <div className='hk-gal-strip' ref={strip} onScroll={onScroll}>
          {urls.map((u, i) => (
            <button key={u} type='button' onClick={() => setFull(i)} aria-label={'Open photo ' + (i + 1)}>
              <img src={u} alt='' loading={i === 0 ? 'eager' : 'lazy'} />
            </button>
          ))}
        </div>
        {urls.length > 1 && <span className='hk-gal-count'>{index + 1} / {urls.length}</span>}
      </div>

      {urls.length > 1 && (
        <div className='hk-gal-dots' aria-hidden='true'>
          {urls.map((u, i) => <span key={u} className={i === index ? 'on' : ''} />)}
        </div>
      )}

      {full !== null && (
        <div className='hk-full' role='dialog' aria-modal='true' aria-label='Photos'>
          <button className='hk-full-x' onClick={() => setFull(null)} aria-label='Close'>
            <X size={24} weight='bold' />
          </button>
          <div className='hk-full-strip' ref={fullStrip}>
            {urls.map(u => (
              <div key={u} onClick={() => setFull(null)}>
                <img src={u} alt='' onClick={e => e.stopPropagation()} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}