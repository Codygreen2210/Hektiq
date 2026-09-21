'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>({ posts: [], communities: [] })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(query))
      const data = await res.json()
      setResults(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white'}}>
      <Header />

      <div style={{maxWidth:'740px', margin:'0 auto', padding:'48px 32px'}}>
        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'2rem', fontWeight:'700', marginBottom:'24px'}}>Search</h1>

        <div style={{display:'flex', gap:'12px', marginBottom:'40px'}}>
          <input
            type='text'
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Search posts and communities...'
            style={{flex:1, background:'#0F172A', border:'1px solid #334155', borderRadius:'10px', padding:'14px 16px', color:'white', fontSize:'1rem', outline:'none', boxSizing:'border-box'}}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', borderRadius:'10px', padding:'14px 24px', color:'white', fontSize:'0.875rem', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap'}}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searched && !loading && (
          <>
            {results.communities?.length > 0 && (
              <div style={{marginBottom:'40px'}}>
                <h2 style={{fontFamily:'var(--font-sora)', fontSize:'1.1rem', fontWeight:'700', marginBottom:'16px', color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.05em', fontSize:'0.75rem'}}>
                  Communities
                </h2>
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                  {results.communities.map((c: any) => (
                    <Link key={c.slug} href={'/c/' + c.slug} style={{display:'flex', alignItems:'center', gap:'16px', background:'#0F172A', border:'1px solid #334155', borderRadius:'12px', padding:'16px', textDecoration:'none'}}>
                      <div style={{width:'40px', height:'40px', borderRadius:'10px', background:'#8B5CF622', border:'1px solid #8B5CF6', color:'#8B5CF6', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontFamily:'var(--font-sora)', flexShrink:0}}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{color:'white', fontWeight:'700', fontSize:'0.875rem', marginBottom:'2px'}}>{c.name}</p>
                        <p style={{color:'#64748B', fontSize:'0.75rem'}}>{c.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.posts?.length > 0 && (
              <div>
                <h2 style={{fontFamily:'var(--font-sora)', color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.05em', fontSize:'0.75rem', marginBottom:'16px'}}>
                  Posts
                </h2>
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                  {results.posts.map((post: any) => (
                    <Link key={post.id} href={'/c/' + post.community_id + '/post/' + post.id} style={{display:'block', background:'#0F172A', border:'1px solid #334155', borderRadius:'12px', padding:'20px', textDecoration:'none'}}>
                      <h3 style={{fontFamily:'var(--font-sora)', fontSize:'1rem', fontWeight:'700', color:'white', marginBottom:'6px'}}>{post.title}</h3>
                      <p style={{color:'#64748B', fontSize:'0.8rem', lineHeight:'1.6', marginBottom:'10px'}}>{post.body.substring(0, 150)}{post.body.length > 150 ? '...' : ''}</p>
                      <div style={{display:'flex', gap:'12px'}}>
                        <span style={{color:'#475569', fontSize:'0.75rem'}}>in {post.community_id}</span>
                        <span style={{color:'#475569', fontSize:'0.75rem'}}>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.posts?.length === 0 && results.communities?.length === 0 && (
              <div style={{textAlign:'center', padding:'48px', color:'#64748B'}}>
                <p style={{fontSize:'1rem', marginBottom:'8px'}}>No results for "{query}"</p>
                <p style={{fontSize:'0.875rem'}}>Try different keywords</p>
              </div>
            )}
          </>
        )}

        {!searched && (
          <div style={{textAlign:'center', padding:'48px', color:'#64748B'}}>
            <p style={{fontSize:'1rem'}}>Search for posts, communities, and people</p>
          </div>
        )}
      </div>

      <footer style={{borderTop:'1px solid #334155', padding:'24px', textAlign:'center', fontSize:'0.875rem', color:'#64748B', marginTop:'48px'}}>
        Hektiq 2026 — For everyone building from nothing
      </footer>
    </main>
  )
}