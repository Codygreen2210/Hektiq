'use client'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <main className='bg-[#080F14] text-white'>
      <style>{`
        @keyframes fadeDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow { 0%,100% { text-shadow:0 0 20px rgba(139,92,246,0.3); } 50% { text-shadow:0 0 40px rgba(6,182,212,0.5); } }
        .header-anim { animation:fadeDown 0.6s ease forwards; }
        .hero-anim { animation:fadeUp 0.8s ease 0.2s both; }
        .sub-anim { animation:fadeUp 0.8s ease 0.4s both; }
        .btn-anim { animation:fadeUp 0.8s ease 0.6s both; }
        .glow-text { animation:glow 4s ease-in-out infinite; }
        .fade-up { opacity:0; transform:translateY(30px); transition:opacity 0.6s ease, transform 0.6s ease; }
        .fade-up.visible { opacity:1; transform:translateY(0); }
        .fade-up:nth-child(2) { transition-delay:0.1s; }
        .fade-up:nth-child(3) { transition-delay:0.2s; }
        .fade-up:nth-child(4) { transition-delay:0.3s; }
      `}</style>

      <header className='header-anim border-b border-[#334155] px-8 py-5 flex justify-between items-center'>
        <span className='text-2xl font-bold gradient-text' style={{fontFamily:'var(--font-sora)'}}>Hektiq</span>
        <nav className='flex items-center gap-8'>
          <a href='/communities' className='text-gray-400 hover:text-white text-sm'>Communities</a>
          <a href='/auth/login' className='text-gray-400 hover:text-white text-sm'>Login</a>
          <a href='/auth/signup' className='gradient-btn text-sm py-2 px-6'>Join Now</a>
        </nav>
      </header>

      <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:'100%'}}>
        
        <div style={{textAlign:'center', padding:'6rem 2rem 4rem', maxWidth:'720px', width:'100%'}}>
          <h1 className='hero-anim' style={{fontFamily:'var(--font-sora)', fontSize:'3.75rem', fontWeight:'700', lineHeight:'1.2', marginBottom:'2rem'}}>
            Real People.<br/>
            Deeper Discussions.<br/>
            <span className='gradient-text glow-text'>Hektiq.</span>
          </h1>
          <p className='sub-anim' style={{color:'#94a3b8', fontSize:'1.125rem', marginBottom:'2.5rem', lineHeight:'1.7'}}>
            The next generation of online communities. Built for real conversations, not algorithms.
          </p>
          <div className='btn-anim' style={{display:'flex', gap:'1rem', justifyContent:'center'}}>
            <a href='/auth/signup' className='gradient-btn' style={{fontSize:'1rem', padding:'0.75rem 2rem'}}>Get started</a>
            <a href='/communities' className='ghost-btn' style={{fontSize:'1rem', padding:'0.75rem 2rem'}}>Explore Communities</a>
          </div>
        </div>

        <div style={{padding:'4rem 2rem 6rem', maxWidth:'1100px', width:'100%'}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1.5rem'}}>
            {[
              { title: 'Real Conversations', desc: 'No scripts. No filters. Just honest dialogue.' },
              { title: 'Passionate Communities', desc: 'Connect with people who actually care.' },
              { title: 'No Bots. Just People.', desc: 'Verified humans only. Always.' },
              { title: 'Privacy First.', desc: 'No tracking. No selling your data. Ever.' },
            ].map((f) => (
              <div key={f.title} className='card fade-up'>
                <h3 style={{fontFamily:'var(--font-sora)', fontWeight:'700', fontSize:'0.875rem', marginBottom:'0.5rem'}}>{f.title}</h3>
                <p style={{color:'#94a3b8', fontSize:'0.75rem', lineHeight:'1.6'}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <footer className='border-t border-[#334155] px-8 py-10 text-center text-gray-500 text-sm'>
        <p>Hektiq 2026 — For everyone building from nothing</p>
      </footer>
    </main>
  )
}