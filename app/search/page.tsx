'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import { CommunityIcon } from '../../components/Icons'

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
    <main style={{minHeight:'100vh', background:'#080F14', color:'white', overflowX:'hidden'}}>
      <Header />

      <div style={{maxWidth:'720px', margin:'0 auto', padding:'32px 16px'}}>
        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'1.8rem', fontWeight:'700', margin:'0 0 20px'}}>Search</h1>

        <div style={{display:'flex', gap:'10px', marginBottom:'32px'}}>
          <input
            type='text'
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
            placeholder='Search posts and communities'
            style={{flex:1, minWidth:0, background:'#0F172A', border:'1px solid #334155', borderRadius:'12px', padding:'13px 16px', color:'white', fontSize:'1rem', outline:'none'}}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', borderRadius:'12px', padding:'0 20px', color:'white', fontSize:'0.9rem', fontWeight:'600', cursor:'pointer'}}
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {searched && !loading && (
          <>
            {results.communities?.length > 0 && (
              <div style={{marginBottom:'32px'}}>
                <p style={{fontSize:'0.75rem', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 12px'}}>Communities</p>
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                  {results.communities.map((c: any) => (
                    <Link key={c.slug} href={'/c/' + c.slug} style={{display:'flex', alignItems:'center', gap:'14px', background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'14px', textDecoration:'none'}}>
                      <div style={{width:'42px', height:'42px', borderRadius:'10px', background:'rgba(139,92,246,0.1)', color:'#A78BFA', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                        <CommunityIcon slug={c.slug} size={22} />
                      </div>
                      <div style={{minWidth:0}}>
                        <p style={{color:'white', fontWeight:'700', fontSize:'0.95rem', margin:'0 0 2px'}}>{c.name}</p>
                        <p style={{color:'#94A3B8', fontSize:'0.8rem', margin:0}}>{c.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.posts?.length > 0 && (
              <div>
                <p style={{fontSize:'0.75rem', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 12px'}}>Posts</p>
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                  {results.posts.map((post: any) => (
                    <Link key={post.id} href={'/c/' + post.community_id + '/post/' + post.id} style={{display:'block', background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'16px', textDecoration:'none'}}>
                      <p style={{fontFamily:'var(--font-sora)', fontSize:'1rem', fontWeight:'700', color:'white', margin:'0 0 6px', wordBreak:'break-word'}}>{post.title}</p>
                      <p style={{color:'#94A3B8', fontSize:'0.85rem', lineHeight:'1.6', margin:'0 0 8px', wordBreak:'break-word'}}>{(post.body || '').substring(0, 150)}{(post.body || '').length > 150 ? '...' : ''}</p>
                      <p style={{color:'#64748B', fontSize:'0.75rem', margin:0}}>in {post.community_id} · {new Date(post.created_at).toLocaleDateString()}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.posts?.length === 0 && results.communities?.length === 0 && (
              <div style={{textAlign:'center', padding:'40px 16px', color:'#64748B'}}>
                <p style={{margin:'0 0 6px'}}>Nothing found for "{query}"</p>
                <p style={{fontSize:'0.85rem', margin:0}}>Try different words.</p>
              </div>
            )}
          </>
        )}

        {!searched && (
          <p style={{textAlign:'center', padding:'40px 16px', color:'#64748B'}}>Search posts and communities across Hektiq.</p>
        )}
      </div>
    </main>
  )
}