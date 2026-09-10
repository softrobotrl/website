import { useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { useEffect, useRef } from 'react'
import humanHandImage from '../assets/human-hand-only.png'
import robotHandImage from '../assets/robot-hand-only.png'
import { AsciiPortrait } from './AsciiPortrait'

export function AsciiHands() {
  const stageRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  // Reveal the hands while their own artwork enters the viewport, not while
  // the preceding copy is entering. Finish before the full stage is visible.
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'end end'] })
  // Use one shared CSS value for all three effects. This keeps the two hands
  // synchronized and avoids separate native scroll animations freezing opacity.
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const approach = reduceMotion ? 1 : Math.max(0, Math.min(1, (value - 0.2) / 0.7))
    stageRef.current?.style.setProperty('--hands-approach', String(approach))
  })

  useEffect(() => {
    const approach = reduceMotion ? 1 : Math.max(0, Math.min(1, (scrollYProgress.get() - 0.2) / 0.7))
    stageRef.current?.style.setProperty('--hands-approach', String(approach))
  }, [reduceMotion, scrollYProgress])

  return (
    <div
      ref={stageRef}
      className="ascii-hands"
      role="img"
      aria-label="A human hand and robotic hand rendered in color ASCII"
    >
      <div className="ascii-hands__field ascii-hands__field--human" aria-hidden="true">
        <AsciiPortrait
          className="ascii-hands__canvas"
          image={humanHandImage}
          imageScale={0.4}
          darkOpacity={0.28}
          horizontalAlign="left"
        />
      </div>
      <div className="ascii-hands__field ascii-hands__field--robot" aria-hidden="true">
        <AsciiPortrait
          className="ascii-hands__canvas"
          image={robotHandImage}
          imageScale={0.4}
          darkOpacity={0.34}
          horizontalAlign="right"
        />
      </div>
    </div>
  )
}
