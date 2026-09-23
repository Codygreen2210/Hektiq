'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import { getAuthHeader } from '../../lib/authToken'
import { CommunitiesIcon } from '../../components/Icons'
import { ArrowLeft } from '@phosphor-icons/react'

export default function CreateCommunity() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('hektiq_username'))
  }, [])

  function generateSlug(n: string) {
    return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40)
  }

  const slug = generateSlug(name)

  async function handleCreate() {
    setError('')
    if (name.trim().length < 3) return setError('Name must be at least 3 characters.')
    if (name.trim().length > 40) return setError('Keep the name under 40 characters.')
    if (!description.trim()) return setError('Add a short description.')
    setLoading(true)
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), slug })
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else window.location.href = '/c/' + slug
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <main className='hk-dots' style={{minHeight:'100vh', color:'var(--text)', overflowX:'hidden'}}>
      <style>{`
        .hk-preview-icon { width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--c2); color: var(--on-c2); border: 2px solid var(--ink); }
        [data-theme='night'] .hk-preview-icon { background: transparent; color: var(--c2); border-color: var(--c2); box-shadow: 0 0 10px var(--c2); }
      `}</style>

      <Header />

      <div style={{maxWidth:'640px', margin:'0 auto', padding:'20px 16px 56px'}}>
        <Link href='/communities' style={{display:'inline-flex', alignItems:'center', gap:'6px', color:'var(--muted)', textDecoration:'none', fontSize:'0.9rem', fontWeight:600, marginBottom:'14px'}}>
          <ArrowLeft size={18} weight='bold' /> Communities
        </Link>

        <h1 className='font-display' style={{fontSize:'2.8rem', lineHeight:1, margin:'0 0 6px'}}>START A COMMUNITY</h1>
        <p style={{color:'var(--muted)', fontSize:'0.98rem', margin:'0 0 22px'}}>A place for people who share your thing.</p>

        {loggedIn === false ? (
          <div className='hk-card' style={{padding:'24px', textAlign:'center'}}>
            <p style={{margin:'0 0 16px'}}>Log in to start a community.</p>
            <div style={{display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap'}}>
              <Link href='/auth/login' className='hk-btn-ghost'>Log in</Link>
              <Link href='/auth/signup' className='hk-btn'>Join free</Link>
            </div>
          </div>
        ) : (
          <div className='hk-card' style={{padding:'20px', borderTop:'6px solid var(--c2)'}}>
            {error && (
              <div style={{border:'2px solid var(--c1)', borderRadius:'8px', padding:'10px 12px', marginBottom:'16px', color:'var(--c1)', fontSize:'0.9rem', fontWeight:600}}>
                {error}
              </div>
            )}

            <div style={{marginBottom:'16px'}}>
              <label className='font-display' style={{display:'block', fontSize:'1.1rem', margin:'0 0 6px'}}>NAME</label>
              <input
                type='text'
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                placeholder='Crawfish Boils'
                maxLength={40}
                className='hk-input'
                style={{fontSize:'1.05rem', fontWeight:600}}
              />
              {name && <p style={{color:'var(--faint)', fontSize:'0.8rem', margin:'6px 0 0'}}>hektiq.com/c/{slug}</p>}
            </div>

            <div style={{marginBottom:'20px'}}>
              <label className='font-display' style={{display:'block', fontSize:'1.1rem', margin:'0 0 6px'}}>DESCRIPTION</label>
              <textarea
                value={description}
                onChange={e => { setDescription(e.target.value); setError('') }}
                placeholder='Recipes, setups, and where to find the best boils'
                rows={3}
                maxLength={200}
                className='hk-input'
                style={{resize:'vertical', lineHeight:'1.6'}}
              />
            </div>

            {name && (
              <div style={{marginBottom:'20px'}}>
                <p className='font-display' style={{fontSize:'1rem', margin:'0 0 8px', color:'var(--muted)'}}>PREVIEW</p>
                <div className='hk-card' style={{display:'flex', alignItems:'center', gap:'14px', padding:'14px'}}>
                  <div className='hk-preview-icon'><CommunitiesIcon size={26} /></div>
                  <div style={{minWidth:0}}>
                    <p style={{fontWeight:800, margin:'0 0 2px', wordBreak:'break-word'}}>{name}</p>
                    <p style={{color:'var(--muted)', fontSize:'0.88rem', margin:0}}>{description || 'Your description here'}</p>
                  </div>
                </div>
              </div>
            )}

            <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
              <button onClick={handleCreate} disabled={loading} className='hk-btn'>
                {loading ? 'Creating...' : 'Create community'}
              </button>
              <Link href='/communities' className='hk-btn-ghost'>Cancel</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}