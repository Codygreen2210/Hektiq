'use client'
import Link from 'next/link'

const communities = [
  { slug: 'money-moves', letter: 'M', accent: 'purple', name: 'Money Moves', description: 'Personal finance, saving, passive income' },
  { slug: 'builders', letter: 'B', accent: 'cyan', name: 'Builders', description: 'Startups, side hustles, indie building' },
  { slug: 'market-moves', letter: 'M', accent: 'purple', name: 'Market Moves', description: 'Stocks, crypto, options, macro' },
  { slug: 'the-grind', letter: 'G', accent: 'cyan', name: 'The Grind', description: 'Career, negotiating, getting ahead' },
  { slug: 'from-nothing', letter: 'F', accent: 'purple', name: 'From Nothing', description: 'Rags to riches, motivation, mindset' },
] as const

export default function Communities() {
  return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white'}}>
      <header style={{borderBottom:'1px solid #334155', padding:'16px 64px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <Link href='/' style={{fontSize:'1.25rem', fontWeight:'600', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:'var(--font-sora)', textDecoration:'none'}}>
          Hektiq
        </Link>
        <nav style={{display:'flex', alignItems:'center', gap:'24px'}}>
          <Link href='/auth/login' style={{fontSize:'0.875rem', color:'#CBD5E1', textDecoration:'none'}}>Login</Link>
          <Link href='/auth/signup' style={{borderRadius:'999px', padding:'8px 20px', fontSize:'0.875rem', fontWeight:'500', color:'white', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', textDecoration:'none'}}>
            Join Now
          </Link>
        </nav>
      </header>
      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'48px 32px 96px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
          <h1 style={{fontFamily:'var(--font-sora)', fontSize:'2.5rem', fontWeight:'700', color:'white'}}>Communities</h1>
          <Link href='/create-community' style={{borderRadius:'999px', padding:'8px 20px', fontSize:'0.875rem', fontWeight:'600', color:'white', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', textDecoration:'none'}}>
            + Create Community
          </Link>
        </div>
        <p style={{color:'#94A3B8', marginBottom:'40px'}}>For everyone building from nothing.</p>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'24px'}}>
          {communities.map((c) => {
            const isPurple = c.accent === 'purple'
            const color = isPurple ? '#8B5CF6' : '#06B6D4'
            const hoverShadow = isPurple
              ? '0 0 0 1px rgba(139,92,246,0.35), 0 12px 32px rgba(139,92,246,0.12)'
              : '0 0 0 1px rgba(6,182,212,0.35), 0 12px 32px rgba(6,182,212,0.12)'
            return (
              <Link
                key={c.slug}
                href={'/c/' + c.slug}
                style={{display:'block', background:'#0F172A', border:'1px solid #334155', borderRadius:'16px', padding:'24px', textDecoration:'none', transition:'all 0.2s ease'}}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.transform = 'translateY(-4px)'
                  el.style.background = '#131C31'
                  el.style.borderColor = color
                  el.style.boxShadow = hoverShadow
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.transform = 'translateY(0)'
                  el.style.background = '#0F172A'
                  el.style.borderColor = '#334155'
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{width:'48px', height:'48px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'600', fontSize:'1rem', marginBottom:'16px', fontFamily:'var(--font-sora)', background: isPurple ? 'rgba(139,92,246,0.15)' : 'rgba(6,182,212,0.15)', border:'1px solid ' + color, color: color}}>
                  {c.letter}
                </div>
                <h3 style={{fontFamily:'var(--font-sora)', fontWeight:'700', fontSize:'1.125rem', color:'white', marginBottom:'6px'}}>
                  {c.name}
                </h3>
                <p style={{fontSize:'0.875rem', color:'#94A3B8', marginBottom:'24px'}}>
                  {c.description}
                </p>
                <p style={{fontSize:'0.75rem', color:'#64748B'}}>
                  0 members
                </p>
              </Link>
            )
          })}
        </div>
      </div>
      <footer style={{borderTop:'1px solid #334155', padding:'24px', textAlign:'center', fontSize:'0.875rem', color:'#64748B'}}>
        Hektiq 2026 — For everyone building from nothing
      </footer>
    </main>
  )
}