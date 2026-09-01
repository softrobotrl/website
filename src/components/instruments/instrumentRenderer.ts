export type InstrumentVariant = 'flow' | 'layers' | 'nodes' | 'cube' | 'sphere' | 'cylinders'

type Point3D = { x: number; y: number; z: number }
type WireGeometry = { points: Point3D[]; edges: Array<[number, number]> }
export type InstrumentRotation = { x: number; y: number }

const iso = (x: number, y: number, z: number) => {
  const angle = Math.PI / 6
  return { x: (x - z) * Math.cos(angle), y: y + (x + z) * Math.sin(angle) }
}

function makeWireGeometry(variant: 'cube' | 'sphere' | 'cylinders'): WireGeometry {
  const points: Point3D[] = []
  const edges: Array<[number, number]> = []

  if (variant === 'cube') {
    const size = 66
    points.push(
      { x: size, y: size, z: size },
      { x: -size, y: -size, z: size },
      { x: -size, y: size, z: -size },
      { x: size, y: -size, z: -size },
      { x: -size, y: -size, z: -size },
      { x: size, y: size, z: -size },
      { x: size, y: -size, z: size },
      { x: -size, y: size, z: size },
    )
    edges.push([0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3], [4, 5], [4, 6], [4, 7], [5, 6], [5, 7], [6, 7])
  } else if (variant === 'cylinders') {
    const radius = 62
    const segments = 24
    for (let index = 0; index < segments; index += 1) {
      const theta = (index / segments) * Math.PI * 2
      const next = (index + 1) % segments
      points.push({ x: Math.cos(theta) * radius, y: Math.sin(theta) * radius, z: -27 })
      points.push({ x: Math.cos(theta) * radius, y: Math.sin(theta) * radius, z: 27 })
      edges.push([index * 2, next * 2], [index * 2 + 1, next * 2 + 1], [index * 2, index * 2 + 1])
    }

    const offset = points.length
    for (let index = 0; index < segments; index += 1) {
      const theta = (index / segments) * Math.PI * 2
      const next = (index + 1) % segments
      points.push({ x: Math.cos(theta) * radius, y: -27, z: Math.sin(theta) * radius })
      points.push({ x: Math.cos(theta) * radius, y: 27, z: Math.sin(theta) * radius })
      edges.push(
        [offset + index * 2, offset + next * 2],
        [offset + index * 2 + 1, offset + next * 2 + 1],
        [offset + index * 2, offset + index * 2 + 1],
      )
    }
  } else {
    const golden = (1 + Math.sqrt(5)) / 2
    const size = 48
    const base = [
      [-1, golden, 0],
      [1, golden, 0],
      [-1, -golden, 0],
      [1, -golden, 0],
      [0, -1, golden],
      [0, 1, golden],
      [0, -1, -golden],
      [0, 1, -golden],
      [golden, 0, -1],
      [golden, 0, 1],
      [-golden, 0, -1],
      [-golden, 0, 1],
    ]
    base.forEach(([x, y, z]) => points.push({ x: x * size, y: y * size, z: z * size }))
    for (let i = 0; i < 12; i += 1) {
      for (let j = i + 1; j < 12; j += 1) {
        const a = points[i]
        const b = points[j]
        if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < size * 2.1) edges.push([i, j])
      }
    }
    base.forEach(([x, y, z]) => points.push({ x: x * size * 0.5, y: y * size * 0.5, z: z * size * 0.5 }))
    for (let i = 0; i < 12; i += 1) {
      for (let j = i + 1; j < 12; j += 1) {
        const a = points[12 + i]
        const b = points[12 + j]
        if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < size * 1.1) edges.push([12 + i, 12 + j])
      }
      edges.push([i, 12 + i])
    }
  }

  return { points, edges }
}

const withAlpha = (stroke: string, alpha: number) => stroke.replace('ALPHA', String(alpha))

function drawLayers(ctx: CanvasRenderingContext2D, time: number, strength: number, fill: string, stroke: string) {
  const size = 43
  const layers = 5
  const gap = 20
  ctx.lineWidth = 1
  for (let i = layers - 1; i >= 0; i -= 1) {
    const yOffset = i * gap - (layers * gap) / 2 + Math.sin(time + i * 0.4) * 4 * strength
    const points = [
      iso(-size, yOffset, -size),
      iso(size, yOffset, -size),
      iso(size, yOffset, size),
      iso(-size, yOffset, size),
    ]
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y))
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
    ctx.strokeStyle = withAlpha(stroke, i === 0 ? 0.35 + strength * 0.55 : 0.1 + strength * 0.12)
    ctx.stroke()

    if (i === 0) {
      const centre = iso(0, yOffset, 0)
      const scan = size * 0.55
      ctx.save()
      ctx.translate(centre.x, centre.y)
      ctx.scale(1, 0.5)
      ctx.beginPath()
      ctx.rect(-scan, -scan, scan * 2, scan * 2)
      ctx.clip()
      for (let line = -scan; line < scan; line += 4) {
        ctx.beginPath()
        ctx.moveTo(-scan, line)
        ctx.lineTo(scan, line)
        ctx.strokeStyle = withAlpha(stroke, 0.08 + strength * 0.24)
        ctx.stroke()
      }
      ctx.restore()
    }
  }
}

function drawCube(ctx: CanvasRenderingContext2D, x: number, y: number, z: number, size: number, color: string) {
  const points = [
    iso(x - size, y - size, z - size),
    iso(x + size, y - size, z - size),
    iso(x + size, y - size, z + size),
    iso(x - size, y - size, z + size),
    iso(x - size, y + size, z - size),
    iso(x + size, y + size, z - size),
    iso(x + size, y + size, z + size),
    iso(x - size, y + size, z + size),
  ]
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ]
  ctx.strokeStyle = color
  ctx.beginPath()
  edges.forEach(([a, b]) => {
    ctx.moveTo(points[a].x, points[a].y)
    ctx.lineTo(points[b].x, points[b].y)
  })
  ctx.stroke()
}

function drawNodes(ctx: CanvasRenderingContext2D, time: number, strength: number, stroke: string) {
  const size = 22
  const float = Math.sin(time) * 4 * strength
  const faint = withAlpha(stroke, 0.11 + strength * 0.16)
  drawCube(ctx, -35, -float, -35, size, faint)
  drawCube(ctx, 35, float, -35, size, faint)
  drawCube(ctx, -35, float, 35, size, faint)
  drawCube(ctx, 35, -float, 35, size, faint)
  drawCube(ctx, 0, Math.cos(time) * 6 * strength - 15, 20, size * 0.9, withAlpha(stroke, 0.35 + strength * 0.55))
}

function drawFlow(ctx: CanvasRenderingContext2D, time: number, strength: number, fill: string, stroke: string) {
  const size = 64
  const segments = 20
  const step = (size * 2) / segments
  const heightAt = (x: number, z: number) => {
    const distance = Math.hypot(x, z)
    const peak = Math.max(0, 45 - distance * 1.1) * (0.25 + strength * 0.75)
    const wave = Math.sin(x * 0.2 + time * 1.5) * Math.cos(z * 0.2 + time * 1.5) * 5 * strength
    return -peak - wave + 15
  }
  for (let z = -size; z < size; z += step) {
    for (let x = -size; x < size; x += step) {
      const heights = [heightAt(x, z), heightAt(x + step, z), heightAt(x + step, z + step), heightAt(x, z + step)]
      const points = [
        iso(x, heights[0], z),
        iso(x + step, heights[1], z),
        iso(x + step, heights[2], z + step),
        iso(x, heights[3], z + step),
      ]
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y))
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()
      const ratio = Math.max(0, -heights[0] / 30)
      ctx.strokeStyle = withAlpha(stroke, 0.06 + ratio * 0.18 + strength * ratio * 0.25)
      ctx.stroke()
    }
  }
}

function drawWireframe(
  ctx: CanvasRenderingContext2D,
  geometry: WireGeometry,
  time: number,
  strength: number,
  stroke: string,
  rotation?: InstrumentRotation,
) {
  const angleY = rotation ? 0.45 + rotation.y : time * 0.34 * strength + 0.45
  const angleX = rotation ? 0.28 + rotation.x : time * 0.14 * strength + 0.28
  const projected = geometry.points.map((point) => {
    const x = point.x * Math.cos(angleY) - point.z * Math.sin(angleY)
    let z = point.z * Math.cos(angleY) + point.x * Math.sin(angleY)
    const y = point.y * Math.cos(angleX) - z * Math.sin(angleX)
    z = z * Math.cos(angleX) + point.y * Math.sin(angleX)
    const scale = 400 / (400 + z)
    return { x: x * scale, y: y * scale, z }
  })
  ctx.lineWidth = 0.9
  geometry.edges.forEach(([a, b]) => {
    const first = projected[a]
    const second = projected[b]
    const depth = (first.z + second.z) / 2
    const alpha = Math.max(0.12, 1 - depth / 210) * (0.18 + strength * 0.72)
    ctx.beginPath()
    ctx.moveTo(first.x, first.y)
    ctx.lineTo(second.x, second.y)
    ctx.strokeStyle = withAlpha(stroke, alpha)
    ctx.stroke()
  })
  projected.forEach((point) => {
    if (point.z < 60) {
      ctx.fillStyle = withAlpha(stroke, 0.18 + strength * 0.82)
      ctx.fillRect(point.x - 1, point.y - 1, 2, 2)
    }
  })
}

export function createInstrumentRenderer(variant: InstrumentVariant, tone: 'orange' | 'black') {
  const wireVariant = variant === 'cube' || variant === 'sphere' || variant === 'cylinders' ? variant : null
  const geometry = wireVariant ? makeWireGeometry(wireVariant) : null
  const stroke = tone === 'black' ? 'rgba(0,0,0,ALPHA)' : 'rgba(255,85,0,ALPHA)'
  const fill = tone === 'black' ? '#000' : '#090806'

  return (ctx: CanvasRenderingContext2D, time: number, strength: number, rotation?: InstrumentRotation) => {
    if (variant === 'layers') drawLayers(ctx, time, strength, fill, stroke)
    else if (variant === 'nodes') drawNodes(ctx, time, strength, stroke)
    else if (variant === 'flow') drawFlow(ctx, time, strength, fill, stroke)
    else if (geometry) drawWireframe(ctx, geometry, time, strength, stroke, rotation)
  }
}
