import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import humanHandImage from '../assets/human-hand-only.png'
import robotHandImage from '../assets/robot-hand-only.png'
import { AsciiPortrait } from './AsciiPortrait'

export function AsciiHands() {
  const stageRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'end start'] })
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.7 })
  const humanX = useTransform(progress, [0, 0.16, 0.58], ['-4%', '-4%', '0%'])
  const robotX = useTransform(progress, [0, 0.16, 0.58], ['4%', '4%', '0%'])
  const handOpacity = useTransform(progress, [0, 0.16, 0.5], [0.24, 0.24, 1])

  return (
    <div
      ref={stageRef}
      className="ascii-hands"
      role="img"
      aria-label="A human hand and robotic hand rendered in color ASCII"
    >
      <motion.div
        className="ascii-hands__field ascii-hands__field--human"
        style={reduceMotion ? undefined : { x: humanX, opacity: handOpacity }}
        aria-hidden="true"
      >
        <AsciiPortrait
          className="ascii-hands__canvas"
          image={humanHandImage}
          imageScale={0.4}
          darkOpacity={0.28}
          horizontalAlign="left"
        />
      </motion.div>
      <motion.div
        className="ascii-hands__field ascii-hands__field--robot"
        style={reduceMotion ? undefined : { x: robotX, opacity: handOpacity }}
        aria-hidden="true"
      >
        <AsciiPortrait
          className="ascii-hands__canvas"
          image={robotHandImage}
          imageScale={0.4}
          darkOpacity={0.34}
          horizontalAlign="right"
        />
      </motion.div>
    </div>
  )
}
