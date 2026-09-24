'use client'
import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import Header from '../../../components/Header'
import { CommunityIcon } from '../../../components/Icons'
import { seededBySlug } from '../../../lib/communities'
import { getAuthHeader } from '../../../lib/authToken'
import { shrinkImage } from '../../../lib/shrinkImage'
import { Camera, PencilSimple, Warning } from '@phosphor-icons/react'

const COLOR: Record<string, string> = {
  'outdoors': '4',
  'sports': '5',
  'money-building': '3',
  'garage': '1',
  'art-makers': '2',
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [bioError, setBioError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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
    setBioError('')
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ bio })
      })
      const data = await res.json()
      if (data.error) setBioError(data.error)
      else if (data.profile) {
        setProfile((p: any) => ({ ...p, ...data.profile }))
        setEditing(false)
      }
    } catch (e) {
      setBioError('Couldn\'t save. Try again.')
    }
    setSaving(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadError('')
    if (!file.type.startsWith('image/')) return setUploadError('That file isn\'t an image.')
    setUploading(true)
    try {
      const blob = await shrinkImage(file)
      const form = new FormData()
      form.append('file', blob, 'avatar.jpg')
      const auth = await getAuthHeader()
      const res = await fetch('/api/uploads/avatar', { method: 'POST', headers: { ...auth }, body: form })
      const data = await res.json()
      if (data.error) setUploadError(data.error)
      else if (data.profile) setProfile((p: any) => ({ ...p, ...data.profile }))
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed. Try again.')
    }
    setUploading(false)
  }

  async function handleDeleteAccount() {
    if (!deletePassword) return setDeleteError('Enter your password.')
    setDeleting(true)
    setDeleteError('')
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ password: deletePassword })
      })
      const data = await res.json()
      if (data.error) {
        setDeleteError(data.error)
        setDeleting(false)
        return
      }
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        await supabase.auth.signOut()
      } catch (e) {}
      localStorage.removeItem('hektiq_username')
      localStorage.removeItem('hektiq_user_id')
      window.location.href = '/'
    } catch (e) {
      setDeleteError('Something went wrong. Try again.')
      setDeleting(false)
    }
  }

  if (loading) return (
    <main style={{minHeight:'100vh', color:'var(--text)'}}>
      <Header />
      <p style={{color:'var(--muted)', textAlign:'center', padding:'64px 16px'}}>Loading...</p>
    </main>
  )

  if (!profile) return (
    <main style={{minHeight:'100vh', color:'var(--text)'}}>
      <Header />
      <div style={{textAlign:'center', padding:'64px 16px'}}>
        <h1 className='font-display' style={{fontSize:'2.4rem', marginBottom:'16px'}}>USER NOT FOUND</h1>
        <Link href='/' className='hk-btn'>Go home</Link>
      </div>
    </main>
  )

  const stripes = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)']

  return (
    <main className='hk-dots' style={{minHeight:'100vh', color:'var(--text)', overflowX:'hidden'}}>
      <style>{`
        .hk-avatar { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; border: 3px solid var(--ink); background: var(--c2); color: var(--on-c2); display: flex; align-items: center; justify-content: center; font-family: var(--font-bebas), sans-serif; font-size: 2.8rem; box-shadow: var(--shadow-hard); }
        [data-theme='night'] .hk-avatar { border-color: var(--c1); box-shadow: 0 0 16px var(--c1); }
        .hk-cam { position: absolute; bottom: 2px; right: 2px; width: 32px; height: 32px; border-radius: 50%; background: var(--c3); color: var(--on-c3); border: 2px solid var(--ink); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        [data-theme='night'] .hk-cam { background: var(--bg); color: var(--c5); border-color: var(--c5); box-shadow: 0 0 8px var(--c5); }
        .hk-stat { text-align: center; padding: 10px 14px; border: 2px solid var(--border-soft); border-radius: 8px; background: var(--surface-2); min-width: 80px; }
        .hk-profile-stripes { height: 14px; display: flex; flex-direction: column; }
        .hk-profile-stripes div { flex: 1; }
        [data-theme='night'] .hk-profile-stripes { box-shadow: 0 0 14px rgba(255,61,154,.5); }
        .hk-danger-zone { border: 2px dashed var(--c1); border-radius: 10px; padding: 18px; margin-top: 40px; }
        .hk-danger-btn { display:inline-flex; align-items:center; gap:8px; background: var(--c1); color: var(--on-c1); border:2px solid var(--ink); border-radius:6px; padding:8px 16px; min-height:40px; font-size:0.9rem; font-weight:700; cursor:pointer; }
        .hk-danger-btn:disabled { opacity: .6; cursor: default; }
      `}</style>

      <Header />

      <div style={{maxWidth:'760px', margin:'0 auto', padding:'28px 16px 64px'}}>
        <div className='hk-card' style={{overflow:'hidden', borderColor:'var(--border)', boxShadow:'var(--shadow-hard)', marginBottom:'32px'}}>
          <div className='hk-profile-stripes'>
            {stripes.map(c => <div key={c} style={{background:c}} />)}
          </div>

          <div style={{padding:'22px', display:'flex', gap:'20px', alignItems:'flex-start', flexWrap:'wrap'}}>
            <div style={{position:'relative', flexShrink:0}}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className='hk-avatar' />
              ) : (
                <div className='hk-avatar'>{profile.username?.charAt(0).toUpperCase()}</div>
              )}
              {isOwner && (
                <label className='hk-cam' aria-label='Change photo'>
                  {uploading ? '...' : <Camera size={16} weight='bold' />}
                  <input type='file' accept='image/*' onChange={handleAvatarUpload} disabled={uploading} style={{display:'none'}} />
                </label>
              )}
            </div>

            <div style={{flex:'1 1 240px', minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap', marginBottom:'6px'}}>
                <h1 className='font-display' style={{fontSize:'2.6rem', lineHeight:1, margin:0, wordBreak:'break-word'}}>{profile.username.toUpperCase()}</h1>
                {isOwner && !editing && (
                  <button onClick={() => setEditing(true)} className='hk-btn-ghost' style={{padding:'4px 12px', minHeight:'34px', fontSize:'0.8rem'}}>
                    <PencilSimple size={14} weight='bold' />
                    Edit bio
                  </button>
                )}
              </div>

              {editing ? (
                <div>
                  <textarea
                    value={bio}
                    onChange={e => { setBio(e.target.value); setBioError('') }}
                    placeholder='Tell people about yourself...'
                    rows={3}
                    maxLength={300}
                    className='hk-input'
                    style={{resize:'vertical', marginBottom:'10px'}}
                  />
                  {bioError && <p style={{color:'var(--c1)', fontSize:'0.85rem', fontWeight:600, margin:'0 0 10px'}}>{bioError}</p>}
                  <div style={{display:'flex', gap:'8px'}}>
                    <button onClick={saveBio} disabled={saving} className='hk-btn' style={{padding:'6px 16px', minHeight:'38px'}}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => { setEditing(false); setBio(profile.bio || ''); setBioError('') }} className='hk-btn-ghost' style={{padding:'6px 16px', minHeight:'38px'}}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{color: profile.bio ? 'var(--text)' : 'var(--faint)', fontSize:'0.98rem', lineHeight:'1.6', margin:'0 0 14px'}}>
                  {profile.bio || (isOwner ? 'Add a bio so people know who you are.' : 'No bio yet.')}
                </p>
              )}

              {uploadError && <p style={{color:'var(--c1)', fontSize:'0.85rem', fontWeight:600, margin:'0 0 10px'}}>{uploadError}</p>}

              <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginTop:'6px'}}>
                <div className='hk-stat'>
                  <p className='font-display' style={{fontSize:'1.6rem', lineHeight:1, margin:0}}>{posts.length}</p>
                  <p style={{fontSize:'0.75rem', color:'var(--muted)', margin:'2px 0 0', fontWeight:600}}>Posts</p>
                </div>
                <div className='hk-stat'>
                  <p className='font-display' style={{fontSize:'1.6rem', lineHeight:1, margin:0}}>{profile.karma || 0}</p>
                  <p style={{fontSize:'0.75rem', color:'var(--muted)', margin:'2px 0 0', fontWeight:600}}>Karma</p>
                </div>
                <div className='hk-stat'>
                  <p className='font-display' style={{fontSize:'1.6rem', lineHeight:1, margin:0}}>{new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).toUpperCase()}</p>
                  <p style={{fontSize:'0.75rem', color:'var(--muted)', margin:'2px 0 0', fontWeight:600}}>Joined</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className='font-display' style={{fontSize:'1.6rem', margin:'0 0 14px'}}>POSTS</h2>

        {posts.length === 0 ? (
          <div className='hk-card' style={{padding:'32px 16px', textAlign:'center', borderStyle:'dashed'}}>
            <p style={{color:'var(--muted)', margin:0}}>No posts yet.</p>
            {isOwner && (
              <Link href='/communities' className='hk-btn' style={{marginTop:'14px'}}>Find a community to post in</Link>
            )}
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {posts.map((post) => {
              const n = COLOR[post.community_id] || '2'
              const c = seededBySlug[post.community_id]
              return (
                <Link key={post.id} href={'/c/' + post.community_id + '/post/' + post.id} className='hk-card' style={{display:'block', padding:'16px', textDecoration:'none', color:'var(--text)', borderLeft:`4px solid var(--c${n})`}}>
                  <p style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'0.8rem', fontWeight:700, color:`var(--c${n})`, margin:'0 0 6px'}}>
                    <CommunityIcon slug={post.community_id} size={15} />
                    {c ? c.name : post.community_id}
                  </p>
                  <p style={{fontWeight:800, fontSize:'1.02rem', margin:'0 0 6px', wordBreak:'break-word'}}>{post.title}</p>
                  <p style={{color:'var(--muted)', fontSize:'0.88rem', lineHeight:'1.6', margin:'0 0 8px', wordBreak:'break-word'}}>{(post.body || '').substring(0, 150)}{(post.body || '').length > 150 ? '...' : ''}</p>
                  <p style={{color:'var(--faint)', fontSize:'0.8rem', margin:0}}>▲ {post.upvotes || 0} · {new Date(post.created_at).toLocaleDateString()}</p>
                </Link>
              )
            })}
          </div>
        )}

        {isOwner && (
          <div className='hk-danger-zone'>
            <h2 className='font-display' style={{fontSize:'1.4rem', margin:'0 0 6px', color:'var(--c1)', display:'flex', alignItems:'center', gap:'8px'}}>
              <Warning size={20} weight='bold' />
              DELETE ACCOUNT
            </h2>
            <p style={{fontSize:'0.9rem', color:'var(--muted)', lineHeight:'1.6', margin:'0 0 14px'}}>
              This deletes your profile, photo, email, and login for good. Your posts and comments stay up but show "deleted account" instead of your name. This can't be undone.
            </p>

            {!showDelete ? (
              <button onClick={() => setShowDelete(true)} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'38px', fontSize:'0.85rem', color:'var(--c1)'}}>
                Delete my account
              </button>
            ) : (
              <div>
                <label className='font-display' style={{display:'block', fontSize:'1.05rem', margin:'0 0 6px'}}>ENTER YOUR PASSWORD TO CONFIRM</label>
                <input
                  type='password'
                  value={deletePassword}
                  onChange={e => { setDeletePassword(e.target.value); setDeleteError('') }}
                  onKeyDown={e => { if (e.key === 'Enter') handleDeleteAccount() }}
                  placeholder='••••••••'
                  autoComplete='current-password'
                  className='hk-input'
                  style={{marginBottom:'10px'}}
                />
                {deleteError && <p style={{color:'var(--c1)', fontSize:'0.88rem', fontWeight:600, margin:'0 0 10px'}}>{deleteError}</p>}
                <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                  <button onClick={handleDeleteAccount} disabled={deleting} className='hk-danger-btn'>
                    {deleting ? 'Deleting...' : 'Yes, delete everything'}
                  </button>
                  <button onClick={() => { setShowDelete(false); setDeletePassword(''); setDeleteError('') }} disabled={deleting} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'40px', fontSize:'0.85rem'}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}