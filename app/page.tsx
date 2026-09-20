'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import Header from '../components/Header'

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
    <main style={{background:'#080F14', color:'white', minHeight:'100vh'}}>
      <style>{`
        @keyframes fadeDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow { 0%,100% { text-shadow:0 0 20px rgba(139,92,246,0.3); } 50% { text-shadow:0 0 40px rgba(6,182,212,0.5); } }
        .hero-anim { animation:fadeUp 0.8s ease 0.2s both; }
        .sub-anim { animation:fadeUp 0.8s ease 0.4s both; }
        .btn-anim { animation:fadeUp 0.8s ease 0.6s both; }
        .glow-text { animation:glow 4s ease-in-out infinite; }
        .fade-up { opacity:0; transform:translateY(30px); transition:opacity 0.6s ease, transform 0.6s ease; }
        .fade-up.visible { opacity:1; transform:translateY(0); }
        .fade-up:nth-child(2) { transition-delay:0.1s; }
        .fade-up:nth-child(3) { transition-delay:0.2s; }
        .fade-up:nth-child(4) { transition-delay:0.3s; }
        .gradient-text { background: linear-gradient(to right, #8B5CF6, #06B6D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .card { background: #0F172A; border: 1px solid #334155; border-radius: 16px; padding: 24px; }
      `}</style>

      <Header />

      <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:'100%'}}>
        <section style={{textAlign:'center', padding:'6rem 2rem 4rem', maxWidth:'720px', width:'100%'}}>
          <h1 className='hero-anim' style={{fontFamily:'var(--font-sora)', fontSize:'3.75rem', fontWeight:'700', lineHeight:'1.2', marginBottom:'2rem'}}>
            Real People.<br/>
            Deeper Discussions.<br/>
            <span className='gradient-text glow-text'>Hektiq.</span>
          </h1>
          <p className='sub-anim' style={{color:'#94a3b8', fontSize:'1.125rem', marginBottom:'2.5rem', lineHeight:'1.7'}}>
            The next generation of online communities. Built for real conversations, not algorithms.
          </p>
          <div className='btn-anim' style={{display:'flex', gap:'1rem', justifyContent:'center'}}>
            <Link href='/auth/signup' style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', color:'white', borderRadius:'999px', padding:'12px 28px', fontWeight:'600', textDecoration:'none', fontSize:'1rem'}}>
              Get started
            </Link>
            <Link href='/communities' style={{background:'transparent', border:'1px solid #334155', color:'white', borderRadius:'999px', padding:'12px 28px', fontWeight:'600', textDecoration:'none', fontSize:'1rem'}}>
              Explore Communities
            </Link>
          </div>
        </section>

        <section style={{padding:'4rem 2rem 6rem', maxWidth:'1100px', width:'100%'}}>
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
        </section>
      </div>

      <footer style={{borderTop:'1px solid #334155', padding:'40px', textAlign:'center', color:'#64748B', fontSize:'0.875rem'}}>
        Hektiq 2026 — For everyone building from nothing
      </footer>
    </main>
  )
}