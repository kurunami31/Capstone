export default function SkeletonLoader({ width = '100%', height = 16, borderRadius = 6, style }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
      ...style,
    }} />
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 24,
      border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <SkeletonLoader height={20} width="60%" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader key={i} height={14} width={`${70 + i * 10}%`} />
      ))}
    </div>
  )
}