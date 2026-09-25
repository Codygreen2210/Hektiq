'use client'

const CSS = `
@keyframes hkcGlint { 0%, 80% { transform: translateX(-140%) skewX(-20deg) } 100% { transform: translateX(340%) skewX(-20deg) } }
@keyframes hkcBuzz { 0%, 90%, 100% { opacity: 1 } 91% { opacity: .4 } 93% { opacity: 1 } 95% { opacity: .6 } 96% { opacity: 1 } }
.hkc { position: relative; overflow: hidden; display: inline-flex; align-items: center; height: 20px; padding: 2px 7px 0; border-radius: 5px; background: #F2C230; border: 2px solid var(--ink); box-sizing: border-box; color: #2A1F16; font-family: var(--font-bebas), 'Bebas Neue', sans-serif; font-size: 15px; letter-spacing: 1px; line-height: 1; white-space: nowrap; flex-shrink: 0; vertical-align: middle; }
.hkc.builder { background: #2A1F16; color: #F2C230; border-color: #2A1F16; }
.hkc-glint { position: absolute; left: 0; top: -4px; width: 10px; height: 30px; background: rgba(255,255,255,.6); animation: hkcGlint 4.5s ease-in-out 1s infinite; }
.hkc.builder .hkc-glint { background: rgba(255,255,255,.3); }
[data-theme='night'] .hkc { background: transparent; border: 1.5px solid #2DD4FF; color: #C9F5FF; box-shadow: 0 0 8px #2DD4FF, inset 0 0 6px rgba(45,212,255,.5); text-shadow: 0 0 6px #2DD4FF; }
[data-theme='night'] .hkc.builder { border-color: #FFE14D; color: #FFF6B8; box-shadow: 0 0 8px #FFE14D, inset 0 0 6px rgba(255,225,77,.5); text-shadow: 0 0 6px #FFE14D; animation: hkcBuzz 6s linear 1.5s infinite; }
[data-theme='night'] .hkc-glint { display: none; }
@media (prefers-reduced-motion: reduce) { .hkc-glint, [data-theme='night'] .hkc.builder { animation: none; } }
`

export default function FounderChip({ number }: { number?: number | null }) {
  if (typeof number !== 'number') return null
  const builder = number === 0
  return (
    <span
      className={'hkc' + (builder ? ' builder' : '')}
      title={builder ? 'Built Hektiq' : 'Founding member #' + number + ' of 1,000'}
      aria-label={builder ? 'Builder, number 0' : 'Founding member number ' + number}
    >
      <style>{CSS}</style>
      {builder ? '#0 BUILDER' : '#' + number}
      <span className='hkc-glint' aria-hidden='true' />
    </span>
  )
}