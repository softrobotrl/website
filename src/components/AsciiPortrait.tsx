import { useEffect, useRef, type RefObject } from 'react'

const GLYPHS = ['·', ':', '1', 'x', '0', 'X', '*', '#', '@']

type AsciiPortraitProps = {
  image: string
  className?: string
  darkOpacity?: number
  imageScale?: number
  horizontalAlign?: 'left' | 'center' | 'right'
  cycleGlyphsOnHover?: boolean
  hoverTargetRef?: RefObject<HTMLElement | null>
}

const hash = (x: number, y: number) => {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return value - Math.floor(value)
}

export function AsciiPortrait({
  image,
  className = '',
  darkOpacity = 0.15,
  imageScale = 1,
  horizontalAlign = 'center',
  cycleGlyphsOnHover = false,
  hoverTargetRef,
}: AsciiPortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const source = new Image()
    source.decoding = 'async'
    const sampleCanvas = document.createElement('canvas')
    const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true })
    if (!sampleContext) return

    let active = false
    let loaded = false
    let frame = 0
    let intersecting = false
    let cachedColumns = 0
    let cachedRows = 0
    let cachedPixels: Uint8ClampedArray | null = null
    let cycleTimer = 0
    let cycleTick = 0

    const draw = () => {
      frame = 0
      if (!loaded || !active) return

      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, rect.width)
      const height = Math.max(1, rect.height)
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      const pixelWidth = Math.round(width * pixelRatio)
      const pixelHeight = Math.round(height * pixelRatio)

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
      }

      const cellWidth = 6
      const cellHeight = 9
      const columns = Math.ceil(width / cellWidth)
      const rows = Math.ceil(height / cellHeight)
      if (!cachedPixels || columns !== cachedColumns || rows !== cachedRows) {
        sampleCanvas.width = columns
        sampleCanvas.height = rows
        const scale = Math.max(columns / source.naturalWidth, rows / source.naturalHeight) * imageScale
        const sourceWidth = source.naturalWidth * scale
        const sourceHeight = source.naturalHeight * scale
        const imageX =
          horizontalAlign === 'left'
            ? 0
            : horizontalAlign === 'right'
              ? columns - sourceWidth
              : (columns - sourceWidth) / 2
        sampleContext.clearRect(0, 0, columns, rows)
        sampleContext.drawImage(source, imageX, (rows - sourceHeight) / 2, sourceWidth, sourceHeight)
        cachedColumns = columns
        cachedRows = rows
        cachedPixels = sampleContext.getImageData(0, 0, columns, rows).data
      }

      const pixels = cachedPixels
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, width, height)
      context.font = '600 9px ui-monospace, SFMono-Regular, Menlo, monospace'
      context.textAlign = 'center'
      context.textBaseline = 'middle'

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = (row * columns + column) * 4
          const alpha = pixels[index + 3] / 255
          if (alpha < 0.08) continue

          const red = pixels[index]
          const green = pixels[index + 1]
          const blue = pixels[index + 2]
          const luminance = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255
          const opacity = alpha * (darkOpacity + luminance * (1 - darkOpacity))
          const baseGlyphIndex = Math.min(
            GLYPHS.length - 1,
            Math.floor((luminance * 0.82 + hash(column, row) * 0.18) * GLYPHS.length),
          )
          const phase = Math.floor(hash(column, row) * 3)
          const cycleOffset = cycleTick ? ((cycleTick + phase) % 3) - 1 : 0
          const glyphIndex = Math.min(GLYPHS.length - 1, Math.max(0, baseGlyphIndex + cycleOffset))

          context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity.toFixed(3)})`
          context.fillText(GLYPHS[glyphIndex], column * cellWidth + cellWidth / 2, row * cellHeight + cellHeight / 2)
        }
      }
    }

    const requestDraw = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(draw)
    }

    const stopGlyphCycle = () => {
      window.clearInterval(cycleTimer)
      cycleTimer = 0
      cycleTick = 0
      requestDraw()
    }

    const startGlyphCycle = () => {
      if (!cycleGlyphsOnHover || window.matchMedia('(prefers-reduced-motion: reduce)').matches || cycleTimer) return
      cycleTimer = window.setInterval(() => {
        cycleTick += 1
        requestDraw()
      }, 180)
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting
        active = intersecting && document.visibilityState === 'visible'
        if (active) {
          if (!source.src) source.src = image
          requestDraw()
        } else {
          cancelAnimationFrame(frame)
          frame = 0
        }
      },
      { rootMargin: '400px 0px' },
    )
    const resizeObserver = new ResizeObserver(requestDraw)
    const hoverTarget = hoverTargetRef?.current ?? canvas
    const onVisibilityChange = () => {
      active = intersecting && document.visibilityState === 'visible'
      if (active) requestDraw()
      else cancelAnimationFrame(frame)
    }

    source.onload = () => {
      loaded = true
      requestDraw()
    }
    visibilityObserver.observe(canvas)
    resizeObserver.observe(canvas)
    document.addEventListener('visibilitychange', onVisibilityChange)
    hoverTarget.addEventListener('pointerenter', startGlyphCycle)
    hoverTarget.addEventListener('pointerleave', stopGlyphCycle)

    return () => {
      cancelAnimationFrame(frame)
      window.clearInterval(cycleTimer)
      visibilityObserver.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      hoverTarget.removeEventListener('pointerenter', startGlyphCycle)
      hoverTarget.removeEventListener('pointerleave', stopGlyphCycle)
      source.onload = null
    }
  }, [cycleGlyphsOnHover, darkOpacity, horizontalAlign, hoverTargetRef, image, imageScale])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />
}
