import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { ScrambleText } from './ScrambleText'

type MaskedHeadingProps = {
  as?: 'h1' | 'h2'
  lines: string[]
  className?: string
  delay?: number
  reveal?: 'load' | 'scrub' | 'static'
  progress?: MotionValue<number>
  scramble?: 'load' | 'inView' | false
}

const lineVariants = {
  hidden: { y: '112%', clipPath: 'inset(0 0 100% 0)' },
  visible: (delay: number) => ({
    y: '0%',
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 0.76, delay, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export function MaskedHeading({
  as = 'h2',
  lines,
  className = '',
  delay = 0,
  reveal = 'static',
  progress,
  scramble,
}: MaskedHeadingProps) {
  const reduceMotion = useReducedMotion()
  const Heading = as === 'h1' ? motion.h1 : motion.h2

  return (
    <Heading className={className} aria-label={lines.join(' ')}>
      {lines.map((line, index) => (
        <span key={line} className="masked-heading__line" aria-hidden="true">
          <MaskedLine
            text={line}
            index={index}
            delay={delay}
            reveal={reveal}
            progress={progress}
            reducedMotion={Boolean(reduceMotion)}
            scramble={scramble ?? (reveal === 'load' ? 'load' : 'inView')}
          />
        </span>
      ))}
    </Heading>
  )
}

function MaskedLine({
  text,
  index,
  delay,
  reveal,
  progress,
  reducedMotion,
  scramble,
}: {
  text: string
  index: number
  delay: number
  reveal: NonNullable<MaskedHeadingProps['reveal']>
  progress?: MotionValue<number>
  reducedMotion: boolean
  scramble: NonNullable<MaskedHeadingProps['scramble']>
}) {
  const staticProgress = useMotionValue(1)
  const source = progress ?? staticProgress
  const start = 0.04 + index * 0.035
  const end = 0.3 + index * 0.035
  const y = useTransform(source, [start, end], ['112%', '0%'])
  const clipPath = useTransform(source, [start, end], ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'])
  const content = scramble ? (
    <ScrambleText trigger={scramble} delay={delay + index * 0.085} duration={reveal === 'load' ? 0.48 : 0.44}>
      {text}
    </ScrambleText>
  ) : (
    text
  )

  if (reveal === 'scrub') {
    return (
      <motion.span className="masked-heading__text" style={reducedMotion ? undefined : { y, clipPath }}>
        {content}
      </motion.span>
    )
  }

  return (
    <motion.span
      className="masked-heading__text"
      custom={delay + index * 0.085}
      initial={!reducedMotion && reveal === 'load' ? 'hidden' : false}
      animate={reveal === 'load' ? 'visible' : undefined}
      variants={lineVariants}
    >
      {content}
    </motion.span>
  )
}
