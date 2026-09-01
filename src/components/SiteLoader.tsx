import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ScrollInstrument, type DiagonalSpinDirection } from './ScrollInstrument'

const LOADER_DIRECTIONS: DiagonalSpinDirection[] = ['northwest', 'southwest', 'northeast', 'southeast']
const LOADER_DIRECTION_KEY = 'gradus-loader-direction'

function readLoaderDirection() {
  try {
    const storedIndex = Number.parseInt(sessionStorage.getItem(LOADER_DIRECTION_KEY) ?? '0', 10)
    return LOADER_DIRECTIONS[Number.isFinite(storedIndex) ? storedIndex % LOADER_DIRECTIONS.length : 0]
  } catch {
    return LOADER_DIRECTIONS[0]
  }
}

export function SiteLoader() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(true)
  const [spinDirection] = useState(readLoaderDirection)
  const directionAdvanced = useRef(false)

  useEffect(() => {
    if (directionAdvanced.current) return
    directionAdvanced.current = true

    try {
      const currentIndex = LOADER_DIRECTIONS.indexOf(spinDirection)
      sessionStorage.setItem(LOADER_DIRECTION_KEY, String((currentIndex + 1) % LOADER_DIRECTIONS.length))
    } catch {
      return
    }
  }, [spinDirection])

  useEffect(() => {
    const fallback = window.setTimeout(() => setVisible(false), reduceMotion ? 350 : 2000)
    return () => window.clearTimeout(fallback)
  }, [reduceMotion])

  if (!visible) return null

  return (
    <motion.div
      className="site-loader"
      initial={false}
      animate={{ opacity: reduceMotion ? [1, 0] : [1, 1, 0] }}
      transition={
        reduceMotion
          ? { duration: 0.25, times: [0, 1], ease: 'easeOut' }
          : { duration: 1.75, times: [0, 0.84, 1], ease: [0.7, 0, 0.3, 1] }
      }
      onAnimationComplete={() => setVisible(false)}
      aria-hidden="true"
      data-loader-direction={spinDirection}
    >
      <div className="site-loader__mark">
        <ScrollInstrument
          variant="cube"
          ariaLabel=""
          tone="black"
          className="site-loader__instrument"
          forceActive
          diagonalSpin={spinDirection}
        />
      </div>
    </motion.div>
  )
}
