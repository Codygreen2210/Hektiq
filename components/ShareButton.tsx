'use client'
import { useState } from 'react'
import { ShareNetwork, Check } from '@phosphor-icons/react'

export default function ShareButton({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.origin + path
    try {
      if (navigator.share) {
        await navigator.share({ title: title + ' · Hektiq', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      // Share menu closed, nothing to do
    }
  }

  return (
    <button onClick={share} className='hk-btn-ghost' style={{padding:'6px 14px', minHeight:'36px', fontSize:'0.85rem'}} aria-live='polite'>
      {copied ? <Check size={15} weight='bold' aria-hidden='true' /> : <ShareNetwork size={15} weight='duotone' aria-hidden='true' />}
      {copied ? 'Link copied' : 'Share'}
    </button>
  )
}