'use client'
import { useRef, useState } from 'react'
import { getAuthHeader } from '../lib/authToken'
import { shrinkImage } from '../lib/shrinkImage'
import { ImageSquare, X } from '@phosphor-icons/react'

const MAX_PHOTOS = 10

type Props = {
  urls: string[]
  onChange: (urls: string[]) => void
  onBusy?: (busy: boolean) => void
}

export default function PhotoPicker({ urls, onChange, onBusy }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState('')

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    setError('')

    const room = MAX_PHOTOS - urls.length
    const files = Array.from(list).slice(0, room)
    if (list.length > room) setError('Up to ' + MAX_PHOTOS + ' photos per post. Extra ones were skipped.')
    if (files.length === 0) return

    setUploading(files.length)
    onBusy?.(true)

    let current = [...urls]
    const auth = await getAuthHeader()

    for (const file of files) {
      try {
        const blob = await shrinkImage(file)
        const form = new FormData()
        form.append('file', blob, 'photo.jpg')
        const res = await fetch('/api/uploads/post-image', { method: 'POST', headers: { ...auth }, body: form })
        const data = await res.json()
        if (data.error) setError(data.error)
        else if (data.url) {
          current = [...current, data.url]
          onChange(current)
        }
      } catch (e: any) {
        setError(e?.message || 'Couldn\'t add that photo.')
      }
      setUploading(n => n - 1)
    }

    onBusy?.(false)
    if (input.current) input.current.value = ''
  }

  function remove(url: string) {
    onChange(urls.filter(u => u !== url))
  }

  const full = urls.length >= MAX_PHOTOS

  return (
    <div>
      <style>{`
        .hk-photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 8px; margin-top: 10px; }
        .hk-photo-tile { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 2px solid var(--border-soft); background: var(--surface-2); }
        .hk-photo-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hk-photo-x { position: absolute; top: 4px; right: 4px; width: 26px; height: 26px; border-radius: 50%; background: rgba(0,0,0,.7); color: #fff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .hk-photo-wait { display: flex; align-items: center; justify-content: center; font-size: .75rem; font-weight: 700; color: var(--muted); }
        .hk-add-photo { display:inline-flex; align-items:center; gap:8px; background: var(--surface-2); color: var(--text); border: 2px dashed var(--border-soft); border-radius: 8px; padding: 10px 14px; font-weight: 700; font-size: 0.9rem; cursor: pointer; }
        .hk-add-photo:hover { border-color: var(--tube, var(--border)); }
        .hk-add-photo:disabled { opacity: .5; cursor: default; }
      `}</style>

      <input
        ref={input}
        type='file'
        accept='image/*'
        multiple
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />

      <button
        type='button'
        className='hk-add-photo'
        onClick={() => input.current?.click()}
        disabled={full || uploading > 0}
      >
        <ImageSquare size={18} weight='bold' />
        {uploading > 0
          ? 'Adding photos...'
          : full
            ? 'Photo limit reached'
            : urls.length > 0
              ? 'Add more photos (' + urls.length + '/' + MAX_PHOTOS + ')'
              : 'Add photos'}
      </button>

      {error && <p style={{ color: 'var(--c1)', fontSize: '0.85rem', fontWeight: 600, margin: '8px 0 0' }}>{error}</p>}

      {(urls.length > 0 || uploading > 0) && (
        <div className='hk-photo-grid'>
          {urls.map(u => (
            <div key={u} className='hk-photo-tile'>
              <img src={u} alt='' />
              <button type='button' className='hk-photo-x' onClick={() => remove(u)} aria-label='Remove photo'>
                <X size={14} weight='bold' />
              </button>
            </div>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <div key={'wait' + i} className='hk-photo-tile hk-photo-wait'>...</div>
          ))}
        </div>
      )}
    </div>
  )
}