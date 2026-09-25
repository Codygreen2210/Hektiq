'use client'
import { useEffect, useId, useState } from 'react'

const CSS = `
@keyframes hkfSpin { to { transform: rotate(360deg) } }
@keyframes hkfSlap {
  0% { transform: scale(2.4) rotate(-28deg); opacity: 0 }
  55% { transform: scale(.9) rotate(4deg); opacity: 1 }
  75% { transform: scale(1.06) rotate(-9deg) }
  100% { transform: scale(1) rotate(-6deg) }
}
@keyframes hkfShine { 0%, 72% { transform: translateX(-170%) skewX(-22deg) } 100% { transform: translateX(300%) skewX(-22deg) } }
@keyframes hkfFlick { 0% { opacity: 0 } 6% { opacity: .9 } 9% { opacity: .1 } 13% { opacity: 1 } 17% { opacity: .3 } 21%, 100% { opacity: 1 } }
@keyframes hkfBuzz { 0%, 90%, 100% { opacity: 1 } 91% { opacity: .35 } 93% { opacity: 1 } 95% { opacity: .55 } 96% { opacity: 1 } }
@keyframes hkfRise { from { transform: translateY(14px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

.hkf-pin { position: relative; transform: rotate(-6deg); animation: hkfSlap .75s cubic-bezier(.2,.8,.3,1.25) .35s both; }
.hkf-layer { position: absolute; inset: 0; border-radius: 50%; }
.hkf-ring { background: conic-gradient(var(--c1) 0deg 72deg, var(--c2) 72deg 144deg, var(--c3) 144deg 216deg, var(--c4) 216deg 288deg, var(--c5) 288deg 360deg); border: 3px solid var(--ink); box-shadow: 4px 4px 0 var(--ink); box-sizing: border-box; }
.hkf-disc { inset: 9%; background: var(--bg); border: 3px solid var(--ink); box-sizing: border-box; }
.hkf-spin { animation: hkfSpin 26s linear infinite; }
.hkf-spin text { fill: var(--ink); }
.hkf-num { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-bebas), 'Bebas Neue', sans-serif; line-height: .9; color: var(--c1); letter-spacing: 1px; padding-top: 4%; font-variant-numeric: tabular-nums; }
.hkf-shine-wrap { position: absolute; inset: 0; border-radius: 50%; overflow: hidden; pointer-events: none; }
.hkf-shine { position: absolute; left: 0; top: -10%; width: 26%; height: 120%; background: rgba(255,255,255,.55); animation: hkfShine 5.5s ease-in-out 1.4s infinite; }
.hkf-scan { display: none; }

.hkf-pin.builder .hkf-ring { border-width: 0; box-shadow: 0 0 0 5px var(--ink), 5px 5px 0 5px #E4502F; }
.hkf-pin.builder .hkf-disc { background: #F2C230; }
.hkf-pin.builder .hkf-num { color: #2A1F16; }

[data-theme='night'] .hkf-pin { animation: none; }
[data-theme='night'] .hkf-glow { animation: hkfFlick 1.6s linear .6s both; }
[data-theme='night'] .hkf-ring { background: #160C26; border: 3px solid #2DD4FF; box-shadow: 0 0 10px #2DD4FF, 0 0 26px rgba(45,212,255,.55), inset 0 0 12px rgba(45,212,255,.45); }
[data-theme='night'] .hkf-disc { background: transparent; border: 2px solid #FF3D9A; box-shadow: 0 0 8px #FF3D9A, inset 0 0 8px rgba(255,61,154,.6); }
[data-theme='night'] .hkf-spin { filter: drop-shadow(0 0 3px #2DD4FF); }
[data-theme='night'] .hkf-spin text { fill: #9BEBFF; }
[data-theme='night'] .hkf-num { color: #FFF6B8; text-shadow: 0 0 6px #FFE14D, 0 0 16px #FFE14D, 0 0 34px #FF7A3D; animation: hkfBuzz 7s linear 2.6s infinite; }
[data-theme='night'] .hkf-shine-wrap { display: none; }
[data-theme='night'] .hkf-scan { display: block; background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0px, rgba(255,255,255,.04) 1px, transparent 1px, transparent 3px); pointer-events: none; }
[data-theme='night'] .hkf-pin.builder .hkf-ring { border-color: #FFE14D; box-shadow: 0 0 12px #FFE14D, 0 0 30px rgba(255,225,77,.6), inset 0 0 12px rgba(255,225,77,.45); }
[data-theme='night'] .hkf-pin.builder .hkf-disc { background: transparent; border-color: #FF7A3D; box-shadow: 0 0 8px #FF7A3D, inset 0 0 8px rgba(255,122,61,.6); }
[data-theme='night'] .hkf-pin.builder .hkf-spin text { fill: #FFF1A6; }
[data-theme='night'] .hkf-pin.builder .hkf-num { color: #FFF6B8; }

.hkf-ribbon { position: relative; display: inline-flex; align-items: center; animation: hkfRise .6s ease-out 1s both; }
.hkf-tail { position: absolute; top: 10px; width: 40px; height: 32px; background: #B83A1F; border: 3px solid var(--ink); box-sizing: border-box; }
.hkf-tail.l { left: -24px; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 32% 50%); }
.hkf-tail.r { right: -24px; clip-path: polygon(0 0, 100% 0, 68% 50%, 100% 100%, 0 100%); }
.hkf-band { position: relative; display: flex; align-items: center; gap: 12px; background: #E4502F; border: 3px solid var(--ink); box-shadow: 4px 4px 0 var(--ink); padding: 5px 18px 3px; font-family: var(--font-bebas), 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 2px; color: #FFF7EA; white-space: nowrap; }
.hkf-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.hkf-ribbon.builder .hkf-tail { background: #C99A12; }
.hkf-ribbon.builder .hkf-band { background: #F2C230; color: #2A1F16; }

[data-theme='night'] .hkf-ribbon { animation: hkfFlick 1.6s linear 1.1s both; }
[data-theme='night'] .hkf-tail { display: none; }
[data-theme='night'] .hkf-band { background: transparent; border: 2px solid #FF3D9A; border-radius: 999px; box-shadow: 0 0 10px #FF3D9A, 0 0 28px rgba(255,61,154,.5), inset 0 0 0 2px rgba(255,255,255,.45), inset 0 0 14px rgba(255,61,154,.55); color: #FFD1E8; text-shadow: 0 0 8px #FF3D9A, 0 0 20px #FF3D9A; padding: 7px 22px 5px; }
[data-theme='night'] .hkf-dot { box-shadow: 0 0 8px #FF3D9A; }
[data-theme='night'] .hkf-ribbon.builder .hkf-band { border-color: #FFE14D; color: #FFF6B8; box-shadow: 0 0 10px #FFE14D, 0 0 28px rgba(255,225,77,.5), inset 0 0 0 2px rgba(255,255,255,.45), inset 0 0 14px rgba(255,225,77,.5); text-shadow: 0 0 8px #FFE14D, 0 0 20px #FF7A3D; }

@media (max-width: 480px) { .hkf-band { font-size: 17px; gap: 8px; padding: 5px 12px 3px; } }

@media (prefers-reduced-motion: reduce) {
  .hkf-pin, .hkf-spin, .hkf-shine, .hkf-ribbon, .hkf-num,
  [data-theme='night'] .hkf-glow, [data-theme='night'] .hkf-num, [data-theme='night'] .hkf-ribbon { animation: none !important; }
}
`

function useRoll(target: number, delay: number) {
  const [shown, setShown] = useState(target)
  useEffect(() => {
    if (target === 0) { setShown(0); return }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(target); return }
    let ticks = 0
    let iv: ReturnType<typeof setInterval> | undefined
    const start = setTimeout(() => {
      iv = setInterval(() => {
        ticks++
        if (ticks > 16) { if (iv) clearInterval(iv); setShown(target); return }
        setShown(1 + Math.floor(Math.random() * 1000))
      }, 55)
    }, delay)
    return () => { clearTimeout(start); if (iv) clearInterval(iv) }
  }, [target, delay])
  return shown
}

// The round pin that sits on the avatar
export function FounderPin({ number, size = 112 }: { number: number; size?: number }) {
  const builder = number === 0
  const shown = useRoll(number, 700)
  const rawId = useId()
  const arcId = 'hkf-arc-' + rawId.replace(/[^a-zA-Z0-9]/g, '')
  const len = String(shown).length
  const numSize = builder ? size * 0.44 : len <= 2 ? size * 0.37 : len === 3 ? size * 0.32 : size * 0.27
  const label = builder ? 'THE BUILDER • HEKTIQ • BUILT THIS PLACE •' : 'FOUNDING MEMBER • HEKTIQ • EST 2026 •'

  return (
    <div
      className={'hkf-pin' + (builder ? ' builder' : '')}
      style={{ width: size, height: size }}
      role='img'
      aria-label={builder ? 'Builder, number 0' : 'Founding member number ' + number + ' of 1,000'}
    >
      <style>{CSS}</style>
      <div className='hkf-glow' style={{ position: 'absolute', inset: 0 }}>
        <div className='hkf-layer hkf-ring' />
        <div className='hkf-layer hkf-disc' />
        <div className='hkf-spin' style={{ position: 'absolute', inset: 0 }}>
          <svg viewBox='0 0 100 100' width={size} height={size} aria-hidden='true'>
            <defs>
              <path id={arcId} d='M 50,50 m -31,0 a 31,31 0 1,1 62,0 a 31,31 0 1,1 -62,0' />
            </defs>
            <text style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: builder ? 7.6 : 8.6, letterSpacing: 0.6 }}>
              <textPath href={'#' + arcId} textLength={builder ? 188 : 192}>{label}</textPath>
            </text>
          </svg>
        </div>
        <div className='hkf-layer hkf-scan' />
        <div className='hkf-num' style={{ fontSize: numSize }} aria-hidden='true'>#{shown}</div>
        <div className='hkf-shine-wrap'><div className='hkf-shine' /></div>
      </div>
    </div>
  )
}

// The banner that goes under the name
export function FounderRibbon({ number }: { number: number }) {
  const builder = number === 0
  return (
    <div className={'hkf-ribbon' + (builder ? ' builder' : '')}>
      <style>{CSS}</style>
      <div className='hkf-tail l' />
      <div className='hkf-tail r' />
      <div className='hkf-band'>
        {builder ? (
          <><span>NO. 0</span><span className='hkf-dot' /><span>BUILT THIS PLACE</span></>
        ) : (
          <><span>FOUNDING MEMBER</span><span className='hkf-dot' /><span>NO. {number} OF 1,000</span></>
        )}
      </div>
    </div>
  )
}