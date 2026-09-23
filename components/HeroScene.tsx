'use client'
import { useEffect, useRef, useState } from 'react'

function Pelican() {
  return (
    <svg viewBox='0 0 70 100' stroke='#2A1F16' strokeWidth='2.4' strokeLinejoin='round' strokeLinecap='round' aria-hidden='true'>
      <rect x='26' y='72' width='18' height='30' rx='2' fill='#8A5A34' />
      <path d='M26 80 H44 M26 90 H44' fill='none' />
      <path d='M31 68 L31 73 M38 68 L38 73' fill='none' />
      <path d='M18 60 C18 44 44 40 54 52 C58 60 50 70 36 71 C26 72 18 68 18 60 Z' fill='#B98A5E' />
      <g className='hk-wing'><path d='M24 58 C32 50 46 50 52 58 C44 64 32 66 24 58 Z' fill='#8C6440' /></g>
      <g className='hk-head'>
        <path d='M40 51 C42 38 40 30 44 23 L50 24 C47 32 50 40 49 51 Z' fill='#F4E9D2' />
        <circle cx='47' cy='20' r='6.5' fill='#F4E3B5' />
        <circle cx='49.5' cy='19' r='1.1' fill='#2A1F16' stroke='none' />
        <path d='M52.5 18.5 L69 25 L67 28.5 L52 23.5 Z' fill='#E8A13A' />
        <path d='M52 23.5 C57 30 63 31 67 28.5' fill='#D9822B' />
      </g>
    </svg>
  )
}

function Flamingo() {
  return (
    <svg viewBox='0 0 60 100' fill='none' stroke='#FFB3D9' strokeWidth='2.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <g className='hk-neck'>
        <path d='M24 56 C12 46 30 36 22 25 C16 17 23 8 30 10' />
        <circle cx='30' cy='11' r='3.6' />
        <path d='M33.5 10.5 L40 13.5 L35.5 17' />
      </g>
      <path d='M22 58 C22 48 44 46 52 56 C48 64 34 68 22 58 Z' />
      <g className='hk-fwing'><path d='M28 57 C35 52 44 53 49 58' /></g>
      <path d='M36 66 L36 97' />
      <path d='M40 65 L46 78 L37 81' />
    </svg>
  )
}

export default function HeroScene() {
  const [theme, setTheme] = useState<'day' | 'night'>('day')
  const [stripeKey, setStripeKey] = useState(0)
  const [fromRight, setFromRight] = useState(false)
  const [flicker, setFlicker] = useState<'' | 'on' | 'off'>('')
  const [paused, setPaused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'night' ? 'night' : 'day')

    function onStart(e: Event) {
      const next = (e as CustomEvent).detail
      if (next === 'day') setFlicker('off')
    }
    function onChange(e: Event) {
      const next = (e as CustomEvent).detail
      setTheme(next)
      setFromRight(next === 'day')
      setStripeKey(k => k + 1)
      setFlicker(next === 'night' ? 'on' : '')
    }
    window.addEventListener('hektiq-theme-start', onStart)
    window.addEventListener('hektiq-theme', onChange)

    const obs = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting))
    if (ref.current) obs.observe(ref.current)

    return () => {
      window.removeEventListener('hektiq-theme-start', onStart)
      window.removeEventListener('hektiq-theme', onChange)
      obs.disconnect()
    }
  }, [])

  const stripes = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)']

  return (
    <div ref={ref} className={'hk-hero ' + (paused ? 'hk-paused' : '')} style={{position:'relative'}}>
      <style>{`
        .hk-scene { position: relative; z-index: 1; width: 400px; max-width: 100%; height: 130px; margin: 0 auto -6px; }
        .hk-sunwrap { position: absolute; left: 50%; top: 10px; width: 230px; height: 115px; margin-left: -115px; overflow: hidden; }
        .hk-sun { position: absolute; inset: 0 0 auto 0; width: 230px; height: 230px; border-radius: 50%; background: linear-gradient(var(--sun1), var(--sun2)); animation: hk-sun-up 1.1s cubic-bezier(.2,.8,.2,1) both; transition: box-shadow .7s ease; }
        [data-theme='night'] .hk-sun { box-shadow: 0 0 40px rgba(255,61,154,.55); }
        .hk-cut { position: absolute; left: 0; right: 0; background: var(--bg); transition: background-color .6s ease; }
        @keyframes hk-sun-up { from { transform: translateY(60px); } to { transform: translateY(0); } }

        .hk-glide { position: absolute; left: 0; top: 0; width: 52px; height: 20px; opacity: 0; animation: hk-glide 15s linear 2s infinite; }
        [data-theme='night'] .hk-glide { display: none; }
        @keyframes hk-glide {
          0% { opacity: 1; transform: translate(-70px, 62px); }
          12% { transform: translate(110px, 36px); }
          24% { opacity: 1; transform: translate(300px, 24px); }
          24.1%, 100% { opacity: 0; transform: translate(300px, 24px); }
        }

        .hk-bird { position: absolute; bottom: -6px; transition: opacity .3s ease; }
        .hk-bird svg { width: 100%; height: 100%; overflow: visible; }
        .hk-bird.left { left: 0; } .hk-bird.right { right: 0; }
        .hk-bird.right svg { transform: scaleX(-1); }

        .hk-pel { width: 66px; height: 100px; }
        .hk-pel svg { filter: drop-shadow(3px 3px 0 #2A1F16); }
        [data-theme='night'] .hk-pel { opacity: 0; pointer-events: none; }
        .hk-head, .hk-wing, .hk-neck, .hk-fwing { transform-box: view-box; }
        .hk-head { transform-origin: 44px 50px; }
        .hk-wing { transform-origin: 24px 58px; }
        [data-theme='day'] .hk-pel.left .hk-wing { animation: hk-stretch 15s ease-in-out 1s infinite; }
        [data-theme='day'] .hk-pel.left .hk-head { animation: hk-gulp 15s ease-in-out 1s infinite; }
        [data-theme='day'] .hk-pel.right .hk-wing { animation: hk-stretch 15s ease-in-out 8.5s infinite; }
        [data-theme='day'] .hk-pel.right .hk-head { animation: hk-gulp 15s ease-in-out 8.5s infinite; }
        @keyframes hk-stretch { 0%,28%,48%,100% { transform: rotate(0); } 33%,43% { transform: rotate(-55deg); } }
        @keyframes hk-gulp { 0%,68%,90%,100% { transform: rotate(0); } 73% { transform: rotate(-42deg); } 76% { transform: rotate(-36deg); } 79% { transform: rotate(-44deg); } 82% { transform: rotate(-36deg); } 85% { transform: rotate(-40deg); } }

        .hk-fla { width: 58px; height: 96px; opacity: 0; transform-origin: bottom center; pointer-events: none; }
        .hk-fla svg { filter: drop-shadow(0 0 4px #FF3D9A) drop-shadow(0 0 10px #FF3D9A); }
        [data-theme='night'] .hk-fla { animation: hk-fla-pop 1.1s ease-out .55s both; }
        [data-theme='night'] .hk-fla.right { animation-delay: .75s; }
        @keyframes hk-fla-pop { 0% { opacity: 0; transform: scale(.4) translateY(20px); } 35% { opacity: 1; transform: scale(1.08); } 45% { opacity: .25; } 55% { opacity: 1; } 65% { opacity: .5; } 75%, 100% { opacity: 1; transform: scale(1); } }
        .hk-neck { transform-origin: 24px 56px; }
        .hk-fwing { transform-origin: 24px 58px; }
        [data-theme='night'] .hk-fla.left .hk-neck { animation: hk-dip 15s ease-in-out 1.5s infinite; }
        [data-theme='night'] .hk-fla.left .hk-fwing { animation: hk-flap 15s ease-in-out 1.5s infinite; }
        [data-theme='night'] .hk-fla.right .hk-neck { animation: hk-dip 15s ease-in-out 9s infinite; }
        [data-theme='night'] .hk-fla.right .hk-fwing { animation: hk-flap 15s ease-in-out 9s infinite; }
        @keyframes hk-dip { 0%,76%,100% { transform: rotate(0); } 80% { transform: rotate(48deg); } 83% { transform: rotate(44deg); } 86% { transform: rotate(50deg); } 90% { transform: rotate(0); } }
        @keyframes hk-flap { 0%,36%,52%,100% { transform: rotate(0); } 39%,45% { transform: rotate(-38deg); } 42%,48% { transform: rotate(0); } }

        .hk-stripes-band { position: relative; z-index: 2; transform: skewY(-2deg); margin: 0 -8px; }

        .hk-paused * { animation-play-state: paused !important; }
        .hk-flick-on { animation: hk-flicker-on 2.2s linear 1; }
        .hk-flick-off { animation: hk-flicker-off .6s linear 1; }
        .hk-title { font-size: 4rem; line-height: .92; margin: 0; }
        @media (max-width: 520px) {
          .hk-title { font-size: 2.9rem; }
          .hk-scene { transform: scale(.85); transform-origin: bottom center; }
        }
      `}</style>

      <div style={{textAlign:'center', padding:'18px 16px 0'}}>
        <p className='font-display' style={{display:'inline-block', fontSize:'0.85rem', letterSpacing:'0.2em', background:'var(--ink)', color:'var(--bg)', padding:'4px 10px', borderRadius:'3px', margin:'0 0 14px', transition:'background .6s, color .6s'}}>
          EST. 2026 · LOUISIANA
        </p>
        <div className='hk-scene'>
          <div className='hk-sunwrap'>
            <div className='hk-sun' />
            <div className='hk-glide'>
              <svg viewBox='0 0 52 20' width='52' height='20' aria-hidden='true'>
                <path d='M0 11 C8 4 15 4 21 9 L25 10 L29 8 C35 2 43 2 50 8 C43 7 37 9 31 13 L26 14 L21 13 C15 9 8 8 0 11 Z' fill='#2A1F16' />
                <path d='M25 10 L36 13 L25 12 Z' fill='#2A1F16' />
              </svg>
            </div>
            <div className='hk-cut' style={{top:'62px', height:'5px'}} />
            <div className='hk-cut' style={{top:'76px', height:'6px'}} />
            <div className='hk-cut' style={{top:'90px', height:'7px'}} />
            <div className='hk-cut' style={{top:'104px', height:'8px'}} />
          </div>
          <div className='hk-bird hk-pel left'><Pelican /></div>
          <div className='hk-bird hk-pel right'><Pelican /></div>
          {theme === 'night' && (
            <>
              <div key={'fl-l-' + stripeKey} className='hk-bird hk-fla left'><Flamingo /></div>
              <div key={'fl-r-' + stripeKey} className='hk-bird hk-fla right'><Flamingo /></div>
            </>
          )}
        </div>
      </div>

      <div key={'st-' + stripeKey} className='hk-stripes-band'>
        {stripes.map((c, i) => (
          <div key={c} className={'hk-stripe' + (fromRight ? ' from-right' : '')} style={{background:c, color:c, animationDelay: (0.1 + i * 0.08) + 's'}} />
        ))}
      </div>

      <div style={{textAlign:'center', padding:'28px 16px 8px'}}>
        <h1 className='font-display hk-title'>BUILT BY THE</h1>
        <h1
          key={'nt-' + stripeKey + flicker}
          className={'font-display hk-title hk-neon-text' + (flicker === 'on' ? ' hk-flick-on' : flicker === 'off' ? ' hk-flick-off' : '')}
          style={{marginBottom:'14px'}}
        >
          COMMUNITY
        </h1>
      </div>
    </div>
  )
}