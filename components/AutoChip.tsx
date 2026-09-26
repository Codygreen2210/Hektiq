// Small gray tag for accounts that post automatically
export default function AutoChip({ show }: { show?: boolean }) {
  if (!show) return null
  return (
    <span
      title='Posted automatically from YouTube'
      aria-label='Automatic post'
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: '18px',
        padding: '1px 6px 0',
        borderRadius: '4px',
        border: '1.5px solid var(--border-soft)',
        background: 'var(--surface-2)',
        color: 'var(--muted)',
        fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
        fontSize: '13px',
        letterSpacing: '1px',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        verticalAlign: 'middle',
      }}
    >
      AUTO
    </span>
  )
}