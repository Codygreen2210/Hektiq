'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import { CommunityIcon } from '../../components/Icons'
import { MagnifyingGlass } from '@phosphor-icons/react'

const COLOR: Record<string, string> = {
  'outdoors': '4',
  'sports': '5',
  'money-building': '3',
  'garage': '1',
  'art-makers': '2',
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>({ posts: [], communities: [] })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function runSearch(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(q.trim()))
      const data = await res.json()
      setResults(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q')
    if (q) {
      setQuery(q)
      runSearch(q)
    }
  }, [])

  function handleSearch() {
    if (!query.trim()) return
    window.history.replaceState(null, '', '/search?q=' + encodeURIComponent(query.trim()))
    runSearch(query)
  }

  return (
    <main className='hk-dots' style={{minHeight:'100vh', color:'var(--text)', overflowX:'hidden'}}>
      <style>{`
        .hk-srow { display:flex; align-items:center; gap:14px; padding:14px; text-decoration:none; color:var(--text); }
        .hk-sicon { width:44px; height:44px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:2px solid var(--ink); transition: background-color .6s, color .6s, box-shadow .6s; }
        [data-theme='night'] .hk-sicon { background: transparent !important; color: var(--g) !important; border-color: var(--g); box-shadow: 0 0 10px var(--g); }
        .hk-ptag { font-weight:700; }
        [data-theme='night'] .hk-ptag { text-shadow: 0 0 8px currentColor; }
      `}</style>

      <Header />

      <div style={{maxWidth:'720px', margin:'0 auto', padding:'28px 16px 64px'}}>
        <h1 className='font-display' style={{fontSize:'3rem', lineHeight:1, margin:'0 0 18px'}}>SEARCH</h1>

        <div style={{display:'flex', gap:'10px', marginBottom:'32px'}}>
          <div style={{flex:1, minWidth:0, position:'relative'}}>
            <span style={{position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--faint)', display:'flex'}}>
              <MagnifyingGlass size={18} weight='bold' />
            </span>
            <input
              type='text'
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
              placeholder='Fishing, trucks, football, budgeting...'
              aria-label='Search'
              className='hk-input'
              style={{paddingLeft:'40px', fontSize:'1rem'}}
            />
          </div>
          <button onClick={handleSearch} disabled={loading} className='hk-btn' style={{flexShrink:0}}>
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {searched && !loading && (
          <>
            {results.communities?.length > 0 && (
              <div style={{marginBottom:'32px'}}>
                <h2 className='font-display' style={{fontSize:'1.4rem', margin:'0 0 12px'}}>COMMUNITIES</h2>
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                  {results.communities.map((c: any) => {
                    const n = COLOR[c.slug] || '2'
                    return (
                      <Link key={c.slug} href={'/c/' + c.slug} className='hk-card hk-srow'>
                        <div className='hk-sicon' style={{background:`var(--c${n})`, color:`var(--on-c${n})`, ['--g' as any]: `var(--c${n})`}}>
                          <CommunityIcon slug={c.slug} size={24} />
                        </div>
                        <div style={{minWidth:0}}>
                          <p style={{fontWeight:800, fontSize:'1rem', margin:'0 0 2px'}}>{c.name}</p>
                          <p style={{color:'var(--muted)', fontSize:'0.85rem', margin:0}}>{c.description}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {results.posts?.length > 0 && (
              <div>
                <h2 className='font-display' style={{fontSize:'1.4rem', margin:'0 0 12px'}}>POSTS</h2>
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                  {results.posts.map((post: any) => {
                    const n = COLOR[post.community_id] || '2'
                    return (
                      <Link key={post.id} href={'/c/' + post.community_id + '/post/' + post.id} className='hk-card' style={{display:'block', padding:'16px', textDecoration:'none', color:'var(--text)', borderLeft:`4px solid var(--c${n})`}}>
                        <p style={{fontWeight:800, fontSize:'1.02rem', margin:'0 0 6px', wordBreak:'break-word'}}>{post.title}</p>
                        <p style={{color:'var(--muted)', fontSize:'0.88rem', lineHeight:'1.6', margin:'0 0 8px', wordBreak:'break-word'}}>{(post.body || '').substring(0, 150)}{(post.body || '').length > 150 ? '...' : ''}</p>
                        <p style={{fontSize:'0.8rem', margin:0, color:'var(--faint)'}}>
                          <span className='hk-ptag' style={{color:`var(--c${n})`}}>{post.community_id}</span> · {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {results.posts?.length === 0 && results.communities?.length === 0 && (
              <div className='hk-card' style={{textAlign:'center', padding:'32px 16px', borderStyle:'dashed'}}>
                <p style={{margin:'0 0 6px', fontWeight:700}}>Nothing found for "{query}"</p>
                <p style={{fontSize:'0.9rem', color:'var(--muted)', margin:0}}>Try different words.</p>
              </div>
            )}
          </>
        )}

        {!searched && (
          <p style={{textAlign:'center', padding:'32px 16px', color:'var(--muted)'}}>Search posts and communities across Hektiq.</p>
        )}
      </div>
    </main>
  )
}