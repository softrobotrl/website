import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useMotionValue, useReducedMotion } from 'framer-motion'
import { ScrollTendon } from './ScrollTendon'
import { TendonFieldContext } from './tendonFieldContext'
import {
  createSmoothTendonGeometry,
  DEFAULT_TENDON_POINTS,
  getTendonGapDiameter,
  TENDON_VIEWBOX_HEIGHT,
  TENDON_VIEWBOX_WIDTH,
  type TendonGap,
  type TendonPoint,
} from './tendonGeometry'

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const TENDON_ANCHOR_SELECTOR = '[data-tendon-node="true"]'

function getLayoutPosition(element: HTMLElement) {
  let x = 0
  let y = 0
  let current: HTMLElement | null = element

  while (current) {
    x += current.offsetLeft
    y += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }

  return { x, y }
}

export function TendonField({ children }: { children: ReactNode }) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)
  const reduceMotion = Boolean(useReducedMotion())
  const progress = useMotionValue(reduceMotion ? 1 : 0)
  const [geometry, setGeometry] = useState(() => createSmoothTendonGeometry(DEFAULT_TENDON_POINTS))

  const progressAtLocalY = useCallback((localY: number) => {
    const field = fieldRef.current
    if (!field) return 1

    const height = Math.max(1, field.getBoundingClientRect().height)
    return clamp(localY / height)
  }, [])

  const getProgressAtElement = useCallback(
    (element: Element) => {
      const field = fieldRef.current
      if (!field) return 1
      const fieldRect = field.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const localCentre = elementRect.top - fieldRect.top + elementRect.height * 0.5
      const activationPoint = localCentre - getTendonGapDiameter(elementRect.width) * 0.5
      return progressAtLocalY(activationPoint)
    },
    [progressAtLocalY],
  )

  useEffect(() => {
    const field = fieldRef.current
    if (!field) return

    const update = () => {
      frameRef.current = 0
      if (reduceMotion) {
        progress.set(1)
        return
      }

      const fieldRect = field.getBoundingClientRect()
      const viewportCue = window.innerHeight * 0.52
      const nextProgress = progressAtLocalY(viewportCue - fieldRect.top)
      const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      progress.set(atPageEnd ? 1 : nextProgress)
    }

    const scheduleUpdate = () => {
      if (!frameRef.current) frameRef.current = requestAnimationFrame(update)
    }

    const resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(field)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('orientationchange', scheduleUpdate)
    scheduleUpdate()

    return () => {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
      resizeObserver.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('orientationchange', scheduleUpdate)
    }
  }, [progress, progressAtLocalY, reduceMotion])

  useEffect(() => {
    const field = fieldRef.current
    if (!field) return

    let frame = 0
    const updateGeometry = () => {
      frame = 0
      const fieldWidth = field.offsetWidth
      const fieldHeight = field.offsetHeight
      if (fieldWidth < 1 || fieldHeight < 1) return
      const fieldPosition = getLayoutPosition(field)

      const nodes = [...field.querySelectorAll<HTMLElement>(TENDON_ANCHOR_SELECTOR)]
        .map((node) => {
          const nodePosition = getLayoutPosition(node)
          const width = node.offsetWidth
          const height = node.offsetHeight
          const gapDiameter = getTendonGapDiameter(width)
          return {
            x: ((nodePosition.x - fieldPosition.x + width / 2) / fieldWidth) * TENDON_VIEWBOX_WIDTH,
            y: ((nodePosition.y - fieldPosition.y + height / 2) / fieldHeight) * TENDON_VIEWBOX_HEIGHT,
            rx: (gapDiameter / 2 / fieldWidth) * TENDON_VIEWBOX_WIDTH,
            ry: (gapDiameter / 2 / fieldHeight) * TENDON_VIEWBOX_HEIGHT,
          }
        })
        .sort((a, b) => a.y - b.y)

      const points: TendonPoint[] = [DEFAULT_TENDON_POINTS[0], ...nodes]
      setGeometry(createSmoothTendonGeometry(points, nodes as TendonGap[]))
    }

    const scheduleGeometry = () => {
      if (!frame) frame = requestAnimationFrame(updateGeometry)
    }
    const observer = new ResizeObserver(scheduleGeometry)
    observer.observe(field)
    field.querySelectorAll<HTMLElement>(TENDON_ANCHOR_SELECTOR).forEach((node) => observer.observe(node))
    window.addEventListener('resize', scheduleGeometry)
    window.addEventListener('orientationchange', scheduleGeometry)
    scheduleGeometry()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', scheduleGeometry)
      window.removeEventListener('orientationchange', scheduleGeometry)
    }
  }, [])

  const context = useMemo(
    () => ({ fieldRef, progress, geometryKey: geometry.path, getProgressAtElement }),
    [geometry.path, getProgressAtElement, progress],
  )

  return (
    <TendonFieldContext.Provider value={context}>
      <div ref={fieldRef} className="relative isolate" data-tendon-field="true">
        <ScrollTendon progress={progress} geometry={geometry} />
        {children}
      </div>
    </TendonFieldContext.Provider>
  )
}
