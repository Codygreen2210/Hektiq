'use client'
import { useState } from 'react'
import Link from 'next/link'

const accentColors = [
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Cyan', value: '#06B6D4' },
  { label: 'Green', value: '#10B981' },
  { label: 'Orange', value: '#F59E0B' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Red', value: '#EF4444' },
]

export default function CreateCommunity() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [accent, setAccent] = useState('#8B5CF6')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function getLetter(name: string) {
    return name.charAt(0).toUpperCase()
  }

  async function handleCreate() {
    if (!name.trim()) return setError('Community name is required')
    if (!description.trim()) return setError('Description is required')
    if (name.length < 3) return setError('Name must be at least 3 characters')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          slug: generateSlug(name),
          letter: getLetter(name),
          accent
        })
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else window.location.href = '/c/' + generateSlug(name)
    } catch (e) {
      setError('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white'}}>
      <header style={{borderBottom:'1px solid #334155', padding:'16px 64px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <Link href='/' style={{fontSize:'1.25rem', fontWeight:'600', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:'var(--font-sora)', textDecoration:'none'}}>
          Hektiq
        </Link>
        <Link href='/communities' style={{fontSize:'0.875rem', color:'#94A3B8', textDecoration:'none'}}>
          ← Back to communities
        </Link>
      </header>

      <div style={{maxWidth:'600px', margin:'0 auto', padding:'48px 32px'}}>
        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'1.75rem', fontWeight:'700', marginBottom:'8px'}}>Create a Community</h1>
        <p style={{color:'#94A3B8', fontSize:'0.875rem', marginBottom:'32px'}}>Build a space for people who share your interests.</p>

        {error && (
          <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'12px', marginBottom:'20px', color:'#FCA5A5', fontSize:'0.875rem'}}>
            {error}
          </div>
        )}

        <div style={{marginBottom:'20px'}}>
          <label style={{display:'block', color:'#94A3B8', fontSize:'0.75rem', fontWeight:'500', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Community Name</label>
          <input
            type='text'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='e.g. Real Estate Investors'
            style={{width:'100%', background:'#0F172A', border:'1px solid #334155', borderRadius:'10px', padding:'14px 16px', color:'white', fontSize:'1rem', outline:'none', boxSizing:'border-box'}}
          />
          {name && (
            <p style={{color:'#475569', fontSize:'0.75rem', marginTop:'6px'}}>
              URL: hektiq.com/c/{generateSlug(name)}
            </p>
          )}
        </div>

        <div style={{marginBottom:'20px'}}>
          <label style={{display:'block', color:'#94A3B8', fontSize:'0.75rem', fontWeight:'500', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder='What is this community about?'
            rows={3}
            style={{width:'100%', background:'#0F172A', border:'1px solid #334155', borderRadius:'10px', padding:'14px 16px', color:'white', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:'1.6'}}
          />
        </div>

        <div style={{marginBottom:'32px'}}>
          <label style={{display:'block', color:'#94A3B8', fontSize:'0.75rem', fontWeight:'500', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Community Color</label>
          <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
            {accentColors.map((c) => (
              <button
                key={c.value}
                onClick={() => setAccent(c.value)}
                style={{width:'36px', height:'36px', borderRadius:'50%', background:c.value, border: accent === c.value ? '3px solid white' : '3px solid transparent', cursor:'pointer', outline:'none'}}
              />
            ))}
          </div>
        </div>

        {name && (
          <div style={{background:'#0F172A', border:'1px solid #334155', borderRadius:'16px', padding:'20px', marginBottom:'32px', display:'flex', alignItems:'center', gap:'16px'}}>
            <div style={{width:'48px', height:'48px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'1.25rem', fontFamily:'var(--font-sora)', background: accent + '22', border:'1px solid ' + accent, color: accent, flexShrink:0}}>
              {getLetter(name)}
            </div>
            <div>
              <p style={{fontFamily:'var(--font-sora)', fontWeight:'700', color:'white', marginBottom:'4px'}}>{name}</p>
              <p style={{color:'#94A3B8', fontSize:'0.875rem'}}>{description || 'Your description here'}</p>
            </div>
          </div>
        )}

        <div style={{display:'flex', gap:'12px'}}>
          <button
            onClick={handleCreate}
            disabled={loading}
            style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', borderRadius:'999px', padding:'12px 32px', color:'white', fontSize:'0.875rem', fontWeight:'600', cursor:'pointer'}}
          >
            {loading ? 'Creating...' : 'Create Community'}
          </button>
          <Link href='/communities' style={{borderRadius:'999px', padding:'12px 32px', fontSize:'0.875rem', fontWeight:'600', color:'#94A3B8', border:'1px solid #334155', textDecoration:'none', display:'inline-block'}}>
            Cancel
          </Link>
        </div>
      </div>
    </main>
  )
}