import type { LegGeometry, Vec2 } from './legDynamics'

// A schematic assembly view driven by the existing continuum-leg simulation.
// Structural parts stay neutral; cable brightness follows simulated tension.
export function drawLegMockup(
  ctx: CanvasRenderingContext2D,
  geometry: LegGeometry,
  strength: number,
  emphasis = 0,
  compact = false,
) {
  const accent = (alpha: number) => `rgba(255,85,0,${alpha * (0.22 + Math.max(strength, emphasis) * 0.78)})`
  const line = (points: Vec2[], color = '#746e64', width = 0.8) => {
    ctx.beginPath()
    points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.stroke()
  }
  const circle = (p: Vec2, r: number, fill: string, stroke = '#aaa49a') => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.fill()
    ctx.strokeStyle = stroke
    ctx.lineWidth = 0.8
    ctx.stroke()
  }
  const plate = (x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = '#ece9e3'
    ctx.strokeStyle = '#8f897f'
    ctx.lineWidth = 0.85
    ctx.fillRect(x, y, w, h)
    ctx.strokeRect(x, y, w, h)
    line([
      { x, y },
      { x: x + 7, y: y - 5 },
      { x: x + w + 7, y: y - 5 },
      { x: x + w, y },
    ])
    line([
      { x: x + w, y },
      { x: x + w + 7, y: y - 5 },
      { x: x + w + 7, y: y + h - 5 },
      { x: x + w, y: y + h },
    ])
  }
  const label = (text: string, x: number, y: number) => {
    ctx.font = '500 9px ui-monospace, monospace'
    ctx.fillStyle = emphasis > 0.1 ? '#17130f' : '#514a43'
    ctx.fillText(text, x, y)
  }

  ctx.save()
  ctx.scale(0.72, 0.72)
  ctx.translate(-4, 12)
  const [hip, knee, foot] = geometry.joints

  // Machined mounting plate, four servo housings and rotating cable drums.
  plate(-56, hip.y - 14, 112, 13)
  geometry.anchors.forEach((anchor, i) => {
    const x = -45 + i * 28
    plate(x - 10, hip.y - 39, 20, 21)
    const tension = geometry.tendons[i].tension
    circle({ x, y: hip.y - 27 }, 6.8, '#faf9f6')
    const angle = tension * Math.PI * 2
    line(
      [
        { x, y: hip.y - 27 },
        { x: x + Math.cos(angle) * 5, y: hip.y - 27 + Math.sin(angle) * 5 },
      ],
      accent(0.95),
      1.4,
    )
    line([{ x, y: hip.y - 20 }, { x, y: hip.y - 5 }, anchor], accent(0.5 + tension * 0.5), 1)
  })
  for (const x of [-49, 49]) circle({ x, y: hip.y - 7 }, 1.8, '#fff')

  // Compliant backbone with offset rear edge for physical depth.
  line(
    geometry.spine.map((p) => ({ x: p.x + 6, y: p.y - 3 })),
    '#d0cbc2',
    7,
  )
  line(geometry.spine, '#aaa399', 10)
  line(geometry.spine, '#f2efe9', 6)

  // Cable-guide discs: a shallow ellipse with drilled cable passages.
  geometry.ribs.forEach(([a, b], i) => {
    const x = (a.x + b.x) / 2
    const y = (a.y + b.y) / 2
    const angle = Math.atan2(b.y - a.y, b.x - a.x)
    const radius = i < 7 ? 38 : 36
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.beginPath()
    ctx.ellipse(0, 2.2, radius, 5.2, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#c9c3b9'
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(0, 0, radius, 5.2, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#f5f3ee'
    ctx.fill()
    ctx.strokeStyle = '#827a6f'
    ctx.lineWidth = 0.7
    ctx.stroke()
    for (const offset of i < 7 ? [-32.4, -21.6, 21.6, 32.4] : [-32.4, 32.4]) {
      ctx.beginPath()
      ctx.ellipse(offset, 0, 1.9, 1.25, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#8e877b'
      ctx.fill()
    }
    ctx.restore()
  })

  geometry.tendons.forEach(({ points, tension }) => {
    // Glow only the cables, keeping the mechanical edges and labels sharp.
    ctx.save()
    ctx.shadowColor = `rgba(255,85,0,${emphasis * 0.65})`
    ctx.shadowBlur = emphasis * 5
    line(points, accent(0.4 + tension * 0.6), 1 + tension * 0.8 + emphasis * 0.5)
    ctx.restore()
    circle(points[points.length - 1], 2.3, '#fff', accent(0.9))
  })
  circle(knee, 4, '#f5f3ee')
  circle(knee, 1.5, '#8f897f')

  // Distal attachment and compliant sole follow the distal segment tangent.
  const beforeFoot = geometry.spine[geometry.spine.length - 2]
  ctx.save()
  ctx.translate(foot.x, foot.y)
  ctx.rotate(Math.atan2(foot.y - beforeFoot.y, foot.x - beforeFoot.x) - Math.PI / 2)
  plate(-16, 0, 47, 10)
  ctx.fillStyle = '#57524b'
  ctx.fillRect(-18, 10, 53, 5)
  for (let x = -14; x < 34; x += 7)
    line(
      [
        { x, y: 12 },
        { x: x + 3, y: 12 },
      ],
      '#c7c0b4',
    )
  ctx.restore()

  // Mobile uses readable HTML labels beneath the model.
  if (compact) {
    ctx.restore()
    return
  }

  // Drafting leaders keep the assembly readable as a design concept.
  line(
    [
      { x: -70, y: hip.y - 10 },
      { x: -90, y: hip.y - 10 },
      { x: -90, y: foot.y },
    ],
    '#c7c1b7',
    0.6,
  )
  line(
    [
      { x: -94, y: hip.y - 10 },
      { x: -86, y: hip.y - 10 },
    ],
    '#a59e93',
  )
  line(
    [
      { x: -94, y: foot.y },
      { x: -86, y: foot.y },
    ],
    '#a59e93',
  )
  label('Servo winches', 67, hip.y - 26)
  line(
    [
      { x: 62, y: hip.y - 29 },
      { x: 51, y: hip.y - 29 },
    ],
    '#b7b0a4',
  )
  label('Cable guides', 64, -42)
  line(
    [
      { x: 60, y: -45 },
      { x: 41, y: -45 },
      { x: 28, y: -33 },
    ],
    '#b7b0a4',
  )
  label('Flexible', -157, -6)
  label('backbone', -157, 5)
  line(
    [
      { x: -104, y: 1 },
      { x: -72, y: 1 },
      { x: knee.x - 8, y: knee.y },
    ],
    '#b7b0a4',
  )
  ctx.restore()
}
