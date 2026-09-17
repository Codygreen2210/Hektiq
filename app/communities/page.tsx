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
    <main className='min-h-screen bg-[#080F14] text-white'>
      <header className='border-b border-[#334155] px-16 py-4 flex justify-between items-center'>
        <Link href='/' className='text-xl font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent' style={{fontFamily:'var(--font-sora)'}}>
          Hektiq
        </Link>
        <nav className='flex items-center gap-6'>
          <Link href='/auth/login' className='text-sm text-slate-300 hover:text-white'>Login</Link>
          <Link href='/auth/signup' className='rounded-full px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]'>
            Join Now
          </Link>
        </nav>
      </header>
      <div className='px-16 pt-12 pb-24'>
        <h1 className='text-4xl font-bold text-white' style={{fontFamily:'var(--font-sora)'}}>Communities</h1>
        <p className='text-slate-400 mt-2'>For everyone building from nothing.</p>
        <div className='mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
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
                className='group block bg-[#0F172A] border border-[#334155] rounded-2xl p-6 transition-all duration-200 ease-out'
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
                <div
                  className='h-12 w-12 rounded-xl flex items-center justify-center font-semibold text-base mb-4'
                  style={{
                    fontFamily: 'var(--font-sora)',
                    background: isPurple ? 'rgba(139,92,246,0.15)' : 'rgba(6,182,212,0.15)',
                    border: '1px solid ' + color,
                    color: color,
                  }}
                >
                  {c.letter}
                </div>
                <h3 className='text-lg font-bold text-white' style={{fontFamily:'var(--font-sora)'}}>
                  {c.name}
                </h3>
                <p className='text-sm text-slate-400 group-hover:text-slate-300 mt-1'>
                  {c.description}
                </p>
                <p className='text-xs text-slate-500 mt-6'>
                  0 members
                </p>
              </Link>
            )
          })}
        </div>
      </div>
      <footer className='border-t border-[#334155] py-6 text-center text-sm text-slate-500'>
        Hektiq 2026 — For everyone building from nothing
      </footer>
    </main>
  )
}
