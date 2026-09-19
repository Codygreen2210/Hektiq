'use client'
import Link from 'next/link'
import { useState, useEffect, use } from 'react'

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile/' + username)
        const data = await res.json()
        if (data.profile) setProfile(data.profile)
        if (data.posts) setPosts(data.posts)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [username])

  if (loading) return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#64748B'}}>Loading...</p>
    </main>
  )

  if (!profile) return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <h1 style={{fontFamily:'var(--font-sora)', fontSize:'2rem', marginBottom:'16px'}}>User not found</h1>
        <Link href='/' style={{color:'#8B5CF6'}}>Go home</Link>
      </div>
    </main>
  )

  return (
    <main style={{minHeight:'100vh', background:'#080F14', color:'white'}}>
      <header style={{borderBottom:'1px solid #334155', padding:'16px 64px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <Link href='/' style={{fontSize:'1.25rem', fontWeight:'600', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:'var(--font-sora)', textDecoration:'none'}}>
          Hektiq
        </Link>
        <nav style={{display:'flex', alignItems:'center', gap:'24px'}}>
          <Link href='/communities' style={{fontSize:'0.875rem', color:'#CBD5E1', textDecoration:'none'}}>Communities</Link>
          <Link href='/auth/login' style={{fontSize:'0.875rem', color:'#CBD5E1', textDecoration:'none'}}>Login</Link>
          <Link href='/auth/signup' style={{borderRadius:'999px', padding:'8px 20px', fontSize:'0.875rem', fontWeight:'500', color:'white', background:'linear-gradient(to right, #8B5CF6, #06B6D4)', textDecoration:'none'}}>
            Join Now
          </Link>
        </nav>
      </header>

      <div style={{maxWidth:'800px', margin:'0 auto', padding:'48px 32px'}}>
        <div style={{background:'#0F172A', border:'1px solid #334155', borderRadius:'20px', padding:'32px', marginBottom:'32px', display:'flex', alignItems:'center', gap:'24px'}}>
          <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'linear-gradient(135deg, #8B5CF6, #06B6D4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontWeight:'700', fontFamily:'var(--font-sora)', flexShrink:0}}>
            {profile.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{fontFamily:'var(--font-sora)', fontSize:'1.5rem', fontWeight:'700', color:'white', marginBottom:'4px'}}>
              {profile.username}
            </h1>
            <p style={{color:'#94A3B8', fontSize:'0.875rem', marginBottom:'8px'}}>
              {profile.bio || 'No bio yet.'}
            </p>
            <div style={{display:'flex', gap:'16px'}}>
              <span style={{color:'#64748B', fontSize:'0.75rem'}}>
                <span style={{color:'white', fontWeight:'600'}}>{posts.length}</span> posts
              </span>
              <span style={{color:'#64748B', fontSize:'0.75rem'}}>
                <span style={{color:'white', fontWeight:'600'}}>{profile.karma || 0}</span> karma
              </span>
              <span style={{color:'#64748B', fontSize:'0.75rem'}}>
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <h2 style={{fontFamily:'var(--font-sora)', fontSize:'1.25rem', fontWeight:'700', marginBottom:'20px'}}>Posts</h2>

        {posts.length === 0 ? (
          <div style={{background:'#0F172A', border:'1px solid #334155', borderRadius:'16px', padding:'48px', textAlign:'center'}}>
            <p style={{color:'#64748B'}}>No posts yet.</p>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {posts.map((post) => (
              <Link key={post.id} href={'/c/' + post.community_id + '/post/' + post.id} style={{display:'block', background:'#0F172A', border:'1px solid #334155', borderRadius:'16px', padding:'24px', textDecoration:'none'}}>
                <h3 style={{fontFamily:'var(--font-sora)', fontSize:'1rem', fontWeight:'700', color:'white', marginBottom:'6px'}}>{post.title}</h3>
                <p style={{color:'#94A3B8', fontSize:'0.875rem', lineHeight:'1.6', marginBottom:'12px'}}>{post.body.substring(0, 150)}{post.body.length > 150 ? '...' : ''}</p>
                <p style={{color:'#475569', fontSize:'0.75rem'}}>{new Date(post.created_at).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer style={{borderTop:'1px solid #334155', padding:'24px', textAlign:'center', fontSize:'0.875rem', color:'#64748B', marginTop:'48px'}}>
        Hektiq 2026 — For everyone building from nothing
      </footer>
    </main>
  )
}