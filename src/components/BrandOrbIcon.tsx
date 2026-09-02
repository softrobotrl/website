import { useEffect, useRef } from 'react'

type BrandOrbIconProps = {
  variant: 'email' | 'linkedin' | 'x'
  tone?: 'dark' | 'light'
}

type OrbDot = {
  x: number
  y: number
  phase: number
  color: readonly [number, number, number]
}

const TAU = Math.PI * 2
const LINKEDIN_PATH =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
const X_PATH =
  'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z'
// Envelope: outer body, an even-odd hole, then the flap chevron filled back in.
const MAIL_PATH = 'M1 4H23V20H1Z M3.6 6.6H20.4V17.4H3.6Z M3.6 6.6L12 13.2L20.4 6.6L20.4 9.4L12 16L3.6 9.4Z'
const ACCENT_RGB = [255, 85, 0] as const

function samplePath(
  pathData: string,
  viewBoxSize: number,
  gridSize: number,
  colorAt: (x: number, y: number) => readonly [number, number, number],
  fillRule: CanvasFillRule = 'nonzero',
) {
  const rasterSize = 256
  const raster = document.createElement('canvas')
  raster.width = rasterSize
  raster.height = rasterSize
  const context = raster.getContext('2d')
  if (!context) return []

  context.scale(rasterSize / viewBoxSize, rasterSize / viewBoxSize)
  context.fillStyle = '#fff'
  context.fill(new Path2D(pathData), fillRule)
  const pixels = context.getImageData(0, 0, rasterSize, rasterSize).data
  const dots: OrbDot[] = []

  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      const normalizedX = (column + 0.5) / gridSize
      const normalizedY = (row + 0.5) / gridSize
      const pixelX = Math.min(rasterSize - 1, Math.floor(normalizedX * rasterSize))
      const pixelY = Math.min(rasterSize - 1, Math.floor(normalizedY * rasterSize))
      if (pixels[(pixelY * rasterSize + pixelX) * 4 + 3] < 128) continue

      const x = (normalizedX - 0.5) * 1.68
      const y = (normalizedY - 0.5) * 1.68
      dots.push({
        x,
        y,
        phase: (normalizedX * 0.62 + normalizedY * 0.38) % 1,
        color: colorAt(normalizedX, normalizedY),
      })
    }
  }

  return dots
}

const geometryCache = new Map<BrandOrbIconProps['variant'], OrbDot[]>()

function getGeometry(variant: BrandOrbIconProps['variant']) {
  const cached = geometryCache.get(variant)
  if (cached) return cached

  let dots: OrbDot[]
  if (variant === 'linkedin') {
    dots = samplePath(LINKEDIN_PATH, 24, 25, () => [10, 102, 194], 'evenodd')
  } else if (variant === 'x') {
    dots = samplePath(X_PATH, 24, 29, () => [244, 241, 236])
  } else {
    dots = samplePath(MAIL_PATH, 24, 27, () => ACCENT_RGB, 'evenodd')
  }

  geometryCache.set(variant, dots)
  return dots
}

function wrappedDistance(a: number, b: number) {
  const distance = Math.abs(a - b) % 1
  return Math.min(distance, 1 - distance)
}

export function BrandOrbIcon({ variant, tone = 'dark' }: BrandOrbIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hoveredRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const context = canvas.getContext('2d')
    if (!context) return undefined

    const size = 96
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const dots = getGeometry(variant)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let animationFrame = 0
    let visible = true

    canvas.width = size * dpr
    canvas.height = size * dpr

    const render = (time: number) => {
      const seconds = time / 1000
      const center = size / 2
      const scale = 42
      const tiltX = Math.sin(seconds * 0.42) * 0.025
      const tiltY = Math.sin(seconds * 0.34) * 0.035
      const sweep = (seconds * (hoveredRef.current ? 0.36 : 0.21)) % 1

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, size, size)

      dots.forEach((dot, index) => {
        const depth = Math.sin(dot.x * 1.8 + dot.y * 1.2 + seconds * 0.5) * 0.5 + 0.5
        const rotatedX = dot.x * Math.cos(tiltY)
        const z = dot.x * Math.sin(tiltY)
        const rotatedY = dot.y * Math.cos(tiltX) - z * Math.sin(tiltX)
        const projectedScale = 1 + z * 0.04
        const phase =
          variant === 'x'
            ? (Math.atan2(dot.y, dot.x) / TAU + 1) % 1
            : variant === 'linkedin'
              ? (dot.y + 0.84) / 1.68
              : dot.phase
        const highlight = Math.exp(-Math.pow(wrappedDistance(phase, sweep) / 0.075, 2))
        const idlePulse = Math.sin(seconds * 1.2 + index * 0.19) * 0.5 + 0.5
        const radius = (tone === 'light' ? 0.96 : 0.88) + depth * 0.34 + highlight * (hoveredRef.current ? 0.8 : 0.55)
        const alpha = Math.min(1, (tone === 'light' ? 0.76 : 0.48) + depth * 0.16 + idlePulse * 0.08 + highlight * 0.28)
        const x = center + rotatedX * scale * projectedScale
        const y = center + rotatedY * scale * projectedScale
        const [red, green, blue] = variant === 'x' && tone === 'light' ? [23, 19, 15] : dot.color

        if (highlight > 0.32) {
          const halo = context.createRadialGradient(x, y, 0, x, y, radius * 4)
          halo.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${highlight * 0.22})`)
          halo.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`)
          context.beginPath()
          context.fillStyle = halo
          context.arc(x, y, radius * 4, 0, TAU)
          context.fill()
        }

        if (tone === 'light') {
          context.beginPath()
          context.fillStyle = `rgba(${Math.round(red * 0.68)}, ${Math.round(green * 0.68)}, ${Math.round(blue * 0.68)}, 0.28)`
          context.arc(x, y, radius + 0.38, 0, TAU)
          context.fill()
        }

        context.beginPath()
        context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`
        context.shadowColor = highlight > 0.35 ? `rgba(${red}, ${green}, ${blue}, ${highlight * 0.38})` : 'transparent'
        context.shadowBlur = highlight > 0.35 ? 3 : 0
        context.arc(x, y, radius, 0, TAU)
        context.fill()
      })

      context.shadowBlur = 0
      if (!reducedMotion && visible) animationFrame = requestAnimationFrame(render)
    }

    const observer = new IntersectionObserver(([entry]) => {
      const nextVisible = entry?.isIntersecting ?? true
      if (nextVisible === visible) return
      visible = nextVisible
      if (visible && !reducedMotion) animationFrame = requestAnimationFrame(render)
      else cancelAnimationFrame(animationFrame)
    })

    observer.observe(canvas)
    render(reducedMotion ? 1200 : performance.now())

    return () => {
      observer.disconnect()
      cancelAnimationFrame(animationFrame)
    }
  }, [tone, variant])

  return (
    <canvas
      ref={canvasRef}
      className="brand-orb-icon"
      aria-hidden="true"
      onPointerEnter={() => {
        hoveredRef.current = true
      }}
      onPointerLeave={() => {
        hoveredRef.current = false
      }}
    />
  )
}
