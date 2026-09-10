import { useEffect, useRef, useState } from 'react'
import { useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { createInstrumentRenderer, type InstrumentVariant } from './instruments/instrumentRenderer'
import { useTendonField } from './tendonFieldContext'

export type { InstrumentVariant } from './instruments/instrumentRenderer'

interface ScrollInstrumentProps {
  variant: InstrumentVariant
  ariaLabel: string
  tone?: 'orange' | 'black'
  className?: string
  forceActive?: boolean
  pointerReactive?: boolean
}

export function ScrollInstrument({
  variant,
  ariaLabel,
  tone = 'orange',
  className = '',
  forceActive = false,
  pointerReactive = false,
}: ScrollInstrumentProps) {
  const rootRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(false)
  const field = useTendonField()
  const fallbackProgress = useMotionValue(0)
  const progress = field?.progress ?? fallbackProgress
  const geometryKey = field?.geometryKey
  const triggerRef = useRef(1)
  const isActive = forceActive || active

  useEffect(() => {
    const calculateTrigger = () => {
      if (forceActive) return
      const root = rootRef.current
      const fieldElement = field?.fieldRef.current
      if (!root || !fieldElement) return

      triggerRef.current = field.getProgressAtElement(root)
      setActive(progress.get() >= triggerRef.current)
    }

    calculateTrigger()
    const observer = new ResizeObserver(calculateTrigger)
    if (field?.fieldRef.current) observer.observe(field.fieldRef.current)
    window.addEventListener('resize', calculateTrigger)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', calculateTrigger)
    }
  }, [field, forceActive, geometryKey, progress])

  useMotionValueEvent(progress, 'change', (latest) => {
    if (forceActive) return
    setActive(latest >= triggerRef.current)
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    if (!canvas || !root) return

    const context = canvas.getContext('2d')
    if (!context) return
    const canvasElement = canvas
    const context2d = context

    const drawInstrument = createInstrumentRenderer(variant, tone)
    let width = 1
    let height = 1
    let dpr = 1
    let frame = 0
    let visible = true
    let strength = forceActive ? 1 : 0
    let last = performance.now()
    let elapsed = 0
    let emphasis = 0
    let targetEmphasis = 0
    let pointerX = 0
    let pointerY = 0
    let targetPointerX = 0
    let targetPointerY = 0
    const animationRate = variant === 'cylinders' ? 0.35 : 1
    const compactLayout = window.matchMedia('(max-width: 899px)')

    function requestRender() {
      if (visible && document.visibilityState === 'visible' && !frame) frame = requestAnimationFrame(render)
    }

    function resize() {
      const rect = canvasElement.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      const pixelWidth = Math.round(width * dpr)
      const pixelHeight = Math.round(height * dpr)
      if (canvasElement.width !== pixelWidth || canvasElement.height !== pixelHeight) {
        canvasElement.width = pixelWidth
        canvasElement.height = pixelHeight
        requestRender()
      }
    }

    function render(now: number) {
      frame = 0
      const delta = Math.min(40, now - last)
      last = now
      if (isActive && !reduceMotion) elapsed += (delta / 1000) * animationRate
      strength += ((isActive ? 1 : 0) - strength) * (reduceMotion ? 1 : 0.055)
      emphasis += (targetEmphasis - emphasis) * (reduceMotion ? 1 : 0.15)
      pointerX += (targetPointerX - pointerX) * 0.075
      pointerY += (targetPointerY - pointerY) * 0.075

      context2d.setTransform(dpr, 0, 0, dpr, 0, 0)
      context2d.clearRect(0, 0, width, height)
      context2d.save()
      context2d.translate(width / 2, height / 2)
      const scale = Math.min(width, height) / 250
      context2d.scale(scale, scale)
      drawInstrument(
        context2d,
        elapsed,
        strength,
        pointerReactive && !reduceMotion ? { x: pointerY * 0.65, y: pointerX * 0.9 } : undefined,
        emphasis,
        compactLayout.matches,
      )
      context2d.restore()

      if ((isActive && !reduceMotion) || Math.abs(targetEmphasis - emphasis) > 0.001) requestRender()
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) requestRender()
        else if (frame) {
          cancelAnimationFrame(frame)
          frame = 0
        }
      },
      { rootMargin: '12% 0px' },
    )
    const resizeObserver = new ResizeObserver(resize)
    const pointerSource = pointerReactive ? root.closest<HTMLElement>('#top') : null
    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      const horizontalRange = Math.max(window.innerWidth * 0.5, rect.width)
      const verticalRange = Math.max(window.innerHeight * 0.5, rect.height)
      targetPointerX = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / horizontalRange))
      targetPointerY = Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / verticalRange))
      requestRender()
    }
    const onPointerLeave = () => {
      targetPointerX = 0
      targetPointerY = 0
    }
    const hoverSource = variant === 'leg' ? root.closest<HTMLElement>('.research-bench__leg') : null
    const onEmphasisEnter = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      targetEmphasis = 1
      requestRender()
    }
    const onEmphasisLeave = () => {
      targetEmphasis = 0
      requestRender()
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestRender()
      else if (frame) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }

    resize()
    visibilityObserver.observe(root)
    resizeObserver.observe(canvasElement)
    if (pointerSource && !reduceMotion) {
      pointerSource.addEventListener('pointermove', onPointerMove, { passive: true })
      pointerSource.addEventListener('pointerleave', onPointerLeave)
    }
    hoverSource?.addEventListener('pointerenter', onEmphasisEnter)
    hoverSource?.addEventListener('pointerleave', onEmphasisLeave)
    document.addEventListener('visibilitychange', onVisibilityChange)
    requestRender()

    return () => {
      cancelAnimationFrame(frame)
      visibilityObserver.disconnect()
      resizeObserver.disconnect()
      pointerSource?.removeEventListener('pointermove', onPointerMove)
      pointerSource?.removeEventListener('pointerleave', onPointerLeave)
      hoverSource?.removeEventListener('pointerenter', onEmphasisEnter)
      hoverSource?.removeEventListener('pointerleave', onEmphasisLeave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [forceActive, isActive, pointerReactive, reduceMotion, tone, variant])

  return (
    <figure
      ref={rootRef}
      className={`scroll-instrument ${className}`}
      data-tendon-active={isActive}
      data-tendon-node="true"
      data-instrument-variant={variant}
      role="img"
      aria-label={ariaLabel}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </figure>
  )
}
