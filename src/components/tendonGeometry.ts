export const TENDON_VIEWBOX_HEIGHT = 3200
export const TENDON_VIEWBOX_WIDTH = 1440
export const TENDON_STROKE_WIDTH = 2.25
const TENDON_GAP_SCALE = 0.68
const TENDON_GAP_MAX = 268

export type TendonPoint = { x: number; y: number }
export type TendonGap = TendonPoint & { rx: number; ry: number }

export type TendonGeometry = {
  path: string
  gaps: TendonGap[]
}

export const DEFAULT_TENDON_POINTS: TendonPoint[] = [
  { x: 1360, y: 0 },
  { x: 1110, y: 600 },
  { x: 820, y: 1100 },
  { x: 250, y: 2100 },
  { x: 250, y: 2800 },
]

export const getTendonGapDiameter = (width: number) => Math.min(width * TENDON_GAP_SCALE, TENDON_GAP_MAX)

export function createSmoothTendonGeometry(points: TendonPoint[], gaps: TendonGap[] = []): TendonGeometry {
  if (points.length < 2) return { path: '', gaps }
  let path = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    const deltaX = next.x - current.x
    const deltaY = next.y - current.y

    if (Math.abs(deltaX) < 0.5) {
      path += ` L${next.x.toFixed(1)} ${next.y.toFixed(1)}`
      continue
    }

    const verticalRun = Math.abs(deltaX) < 100
    const arc = verticalRun ? -Math.min(190, Math.abs(deltaY) * 0.34) : 0
    const firstControl = {
      x: current.x + deltaX * 0.18 + arc,
      y: current.y + deltaY * 0.44,
    }
    const secondControl = {
      x: next.x - deltaX * 0.18 + arc,
      y: next.y - deltaY * 0.44,
    }
    const curve = `C${firstControl.x.toFixed(1)} ${firstControl.y.toFixed(1)} ${secondControl.x.toFixed(1)} ${secondControl.y.toFixed(1)} ${next.x.toFixed(1)} ${next.y.toFixed(1)}`
    path += ` ${curve}`
  }

  return { path, gaps }
}
