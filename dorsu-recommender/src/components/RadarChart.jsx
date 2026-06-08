export default function RadarChart({ scores, size, labels, colors }) {
  const S = size || 200
  const cx = S / 2
  const cy = S / 2
  const r = S * 0.38

  const dims = ['R', 'I', 'A', 'S', 'E', 'C']
  const data = dims.map(d => ({
    label: labels?.[d] || d,
    value: (scores?.[d] || 0) / 100,
    color: colors?.[d] || '#3b82f6',
  }))

  const angle = (2 * Math.PI) / data.length
  const polyPoints = data.map((d, i) => {
    const a = -Math.PI / 2 + i * angle
    const x = cx + r * d.value * Math.cos(a)
    const y = cy + r * d.value * Math.sin(a)
    return `${x},${y}`
  }).join(' ')

  const vertexPoints = data.map((_, i) => {
    const a = -Math.PI / 2 + i * angle
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    return `${x},${y}`
  })

  const gridLevels = [0.25, 0.5, 0.75, 1]
  const fillColors = ['rgba(148,163,184,0.04)', 'rgba(148,163,184,0.08)', 'rgba(148,163,184,0.12)', 'rgba(148,163,184,0.16)']

  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ flexShrink: 0 }}>
      {gridLevels.map((level, li) => {
        const points = data.map((_, i) => {
          const a = -Math.PI / 2 + i * angle
          const x = cx + r * level * Math.cos(a)
          const y = cy + r * level * Math.sin(a)
          return `${x},${y}`
        }).join(' ')
        return <polygon key={li} points={points} fill={fillColors[li]} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      })}

      {vertexPoints.map((_, i) => {
        const a = -Math.PI / 2 + i * angle
        const x2 = cx + r * Math.cos(a)
        const y2 = cy + r * Math.sin(a)
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      })}

      <polygon points={polyPoints} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="2" />

      {data.map((d, i) => {
        const a = -Math.PI / 2 + i * angle
        const x = cx + r * d.value * Math.cos(a)
        const y = cy + r * d.value * Math.sin(a)
        const lx = cx + (r + 22) * Math.cos(a)
        const ly = cy + (r + 22) * Math.sin(a)

        return (
          <g key={i}>
            <circle cx={x} cy={y} r={3} fill={d.color} stroke="#1e293b" strokeWidth="1.5" />
            <text
              x={lx} y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#94a3b8"
              fontSize={10}
              fontWeight={600}
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
