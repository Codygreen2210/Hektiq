import { parseVideo, providerName } from '../lib/video'
import { Play } from '@phosphor-icons/react/dist/ssr'

export default function VideoPreview({ url }: { url: string }) {
  const v = parseVideo(url)
  if (!v) return null

  if (v.thumb) {
    return (
      <div style={{position:'relative', width:'100%', maxWidth:'360px', aspectRatio: v.vertical ? '9 / 16' : '16 / 9', maxHeight: v.vertical ? '260px' : undefined, borderRadius:'8px', overflow:'hidden', border:'2px solid var(--border-soft)', margin:'0 0 10px', background:'#0B0B0B'}}>
        <img src={v.thumb} alt='' loading='lazy' style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}} />
        <span style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <span style={{width:'46px', height:'46px', borderRadius:'50%', background:'var(--c1)', color:'#fff', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Play size={20} weight='fill' />
          </span>
        </span>
        <span style={{position:'absolute', left:'8px', bottom:'8px', background:'rgba(0,0,0,.72)', color:'#fff', fontSize:'0.72rem', fontWeight:700, padding:'3px 8px', borderRadius:'4px'}}>
          {providerName(v.provider)}
        </span>
      </div>
    )
  }

  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:'6px', background:'var(--surface-2)', border:'2px solid var(--border-soft)', color:'var(--text)', borderRadius:'6px', padding:'4px 10px', fontSize:'0.8rem', fontWeight:700, margin:'0 0 10px'}}>
      <Play size={13} weight='fill' style={{color:'var(--c1)'}} />
      {providerName(v.provider)} video
    </span>
  )
}