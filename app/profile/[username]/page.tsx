'use client'
import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import Header from '../../../components/Header'

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const loggedIn = localStorage.getItem('hektiq_username')
    if (loggedIn === username) setIsOwner(true)

    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile/' + username)
        const data = await res.json()
        if (data.profile) {
          setProfile(data.profile)
          setBio(data.profile.bio || '')
        }
        if (data.posts) setPosts(data.posts)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [username])

  async function saveBio() {
    setSaving(true)
    try {
      const userId = localStorage.getItem('hektiq_user_id')
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, bio })
      })
      const data = await res.json()
      if (data.profile) {
        setProfile(data.profile)
        setEditing(false)
      }
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const userId = localStorage.getItem('hektiq_user_id')
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const ext = file.name.split('.').pop()
      const path = userId + '.' + ext
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadError) { console.error(uploadError); setUploading(false); return }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatarUrl = urlData.publicUrl
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, bio, avatar_url: avatarUrl })
      })
      const data = await res.json()
      if (data.profile) {
        setProfile(data.profile)
        window.location.reload()
      }
    } catch (e) {
      console.error(e)
    }
    setUploading(false)
  }

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
      <Header />

      <div style={{maxWidth:'800px', margin:'0 auto', padding:'48px 32px'}}>
        <div style={{background:'#0F172A', border:'1px solid #334155', borderRadius:'20px', padding:'32px', marginBottom:'32px'}}>
          <div style={{display:'flex', alignItems:'flex-start', gap:'24px'}}>
            <div style={{position:'relative', flexShrink:0}}>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  style={{width:'80px', height:'80px', borderRadius:'50%', objectFit:'cover'}}
                />
              ) : (
                <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'linear-gradient(135deg, #8B5CF6, #06B6D4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontWeight:'700', fontFamily:'var(--font-sora)'}}>
                  {profile.username?.charAt(0).toUpperCase()}
                </div>
              )}
              {isOwner && (
                <label style={{position:'absolute', bottom:0, right:0, background:'#334155', borderRadius:'50%', width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'0.75rem'}}>
                  {uploading ? '⏳' : '📷'}
                  <input type='file' accept='image/*' onChange={handleAvatarUpload} style={{display:'none'}} />
                </label>
              )}
            </div>

            <div style={{flex:1}}>
              <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px'}}>
                <h1 style={{fontFamily:'var(--font-sora)', fontSize:'1.5rem', fontWeight:'700', color:'white'}}>
                  {profile.username}
                </h1>
                {isOwner && !editing && (
                  <button
                    onClick={() => setEditing(true)}
                    style={{background:'transparent', border:'1px solid #334155', color:'#94A3B8', borderRadius:'999px', padding:'4px 12px', fontSize:'0.75rem', cursor:'pointer'}}
                  >
                    Edit profile
                  </button>
                )}
              </div>

              {editing ? (
                <div>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder='Tell people about yourself...'
                    rows={3}
                    style={{width:'100%', background:'#080F14', border:'1px solid #334155', borderRadius:'10px', padding:'12px', color:'white', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', resize:'vertical', marginBottom:'12px'}}
                  />
                  <div style={{display:'flex', gap:'8px'}}>
                    <button
                      onClick={saveBio}
                      disabled={saving}
                      style={{background:'linear-gradient(to right, #8B5CF6, #06B6D4)', border:'none', borderRadius:'999px', padding:'8px 20px', color:'white', fontSize:'0.875rem', fontWeight:'600', cursor:'pointer'}}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      style={{background:'transparent', border:'1px solid #334155', borderRadius:'999px', padding:'8px 20px', color:'#94A3B8', fontSize:'0.875rem', cursor:'pointer'}}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{color:'#94A3B8', fontSize:'0.875rem', marginBottom:'12px'}}>
                  {profile.bio || (isOwner ? 'Click edit profile to add a bio...' : 'No bio yet.')}
                </p>
              )}

              <div style={{display:'flex', gap:'20px', marginTop:'12px'}}>
                <div style={{textAlign:'center'}}>
                  <p style={{color:'white', fontWeight:'700', fontSize:'1rem'}}>{posts.length}</p>
                  <p style={{color:'#64748B', fontSize:'0.75rem'}}>Posts</p>
                </div>
                <div style={{textAlign:'center'}}>
                  <p style={{color:'white', fontWeight:'700', fontSize:'1rem'}}>{profile.karma || 0}</p>
                  <p style={{color:'#64748B', fontSize:'0.75rem'}}>Karma</p>
                </div>
                <div style={{textAlign:'center'}}>
                  <p style={{color:'white', fontWeight:'700', fontSize:'1rem'}}>{new Date(profile.created_at).toLocaleDateString()}</p>
                  <p style={{color:'#64748B', fontSize:'0.75rem'}}>Joined</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 style={{fontFamily:'var(--font-sora)', fontSize:'1.25rem', fontWeight:'700', marginBottom:'20px'}}>Posts</h2>

        {posts.length === 0 ? (
          <div style={{background:'#0F172A', border:'1px solid #334155', borderRadius:'16px', padding:'48px', textAlign:'center'}}>
            <p style={{color:'#64748B'}}>No posts yet.</p>
            {isOwner && (
              <Link href='/communities' style={{color:'#8B5CF6', textDecoration:'none', fontSize:'0.875rem', display:'block', marginTop:'12px'}}>
                Browse communities to post
              </Link>
            )}
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