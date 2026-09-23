const PALETTE: Record<string, string> = {
  k: 'var(--pk)',
  '1': 'var(--p1)',
  '2': 'var(--p2)',
  '3': 'var(--p3)',
  w: 'var(--pw)',
}

const FLAME = [
  '....k....',
  '...k1k...',
  '...k11k..',
  '..k111kk.',
  '.k112111k',
  '.k122211k',
  'k1223221k',
  'k1233321k',
  'k1233321k',
  '.k12221k.',
  '..kkkkk..',
]

const SPARKLE = [
  '....k....',
  '...k1k...',
  '...k1k...',
  '.kk111kk.',
  'k111w111k',
  '.kk111kk.',
  '...k1k...',
  '...k1k...',
  '....k....',
]

const TROPHY = [
  '..kkkkkkk..',
  'kkk1w112kkk',
  'k.k1w112k.k',
  'k.k11112k.k',
  '.kk11112kk.',
  '...k1122...',
  '....k2k....',
  '....k2k....',
  '...kkkkk...',
  '..k33333k..',
  '..kkkkkkk..',
]

const STYLES = `
  .hk-pix { --pk: #2A1F16; --pw: #FFF7EA; transition: filter .6s ease; }
  .hk-pix rect { transition: fill .6s ease; }
  .hk-pix-flame { --p1: var(--c1); --p2: var(--c2); --p3: var(--c3); }
  .hk-pix-sparkle { --p1: var(--c3); --p2: var(--c2); --p3: var(--c3); }
  .hk-pix-trophy { --p1: var(--c3); --p2: var(--c2); --p3: var(--c1); }

  [data-theme='night'] .hk-pix { --pk: transparent; --pw: #FFFFFF; }
  [data-theme='night'] .hk-pix-flame { --p1: #FF3D9A; --p2: #B43CFF; --p3: #FFB3E6; filter: drop-shadow(0 0 3px #FF3D9A) drop-shadow(0 0 6px #B43CFF); }
  [data-theme='night'] .hk-pix-sparkle { --p1: #2DD4FF; --p2: #2DD4FF; --p3: #9EF0FF; filter: drop-shadow(0 0 3px #2DD4FF) drop-shadow(0 0 7px #2DD4FF); }
  [data-theme='night'] .hk-pix-trophy { --p1: #2DD4FF; --p2: #FF3D9A; --p3: #FF3D9A; filter: drop-shadow(0 0 3px #2DD4FF) drop-shadow(0 0 6px #FF3D9A); }
`

function Pixel({ grid, size = 20, kind }: { grid: string[]; size?: number; kind: string }) {
  const h = grid.length
  const w = grid[0].length
  const rects: React.ReactNode[] = []
  grid.forEach((row, y) => {
    row.split('').forEach((ch, x) => {
      const fill = PALETTE[ch]
      if (fill) rects.push(<rect key={x + '-' + y} x={x} y={y} width='1.02' height='1.02' fill={fill} />)
    })
  })
  return (
    <svg
      className={'hk-pix hk-pix-' + kind}
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={Math.round(size * h / w)}
      shapeRendering='crispEdges'
      aria-hidden='true'
      style={{overflow:'visible'}}
    >
      <style>{STYLES}</style>
      {rects}
    </svg>
  )
}

export function PixelFlame({ size }: { size?: number }) {
  return <Pixel grid={FLAME} size={size} kind='flame' />
}

export function PixelSparkle({ size }: { size?: number }) {
  return <Pixel grid={SPARKLE} size={size} kind='sparkle' />
}

export function PixelTrophy({ size }: { size?: number }) {
  return <Pixel grid={TROPHY} size={size} kind='trophy' />
}