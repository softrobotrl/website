import { motion, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from 'framer-motion'
import { useRef } from 'react'

const wordmark = 'Gradus RL'

const wordmarkVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.075,
    },
  },
}

const letterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: '0.22em',
    filter: 'blur(5px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.58,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const currentYear = new Date().getFullYear()
  const { scrollYProgress } = useScroll({ target: footerRef, offset: ['start end', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 105, damping: 30, mass: 0.7 })
  const glowScale = useTransform(progress, [0.08, 0.78], [0.82, 1])
  const glowOpacity = useTransform(progress, [0.08, 0.7], [0.25, 1])

  return (
    <footer ref={footerRef} className="gradient-footer">
      <motion.div
        aria-hidden="true"
        className="gradient-footer__glow"
        style={reduceMotion ? undefined : { scale: glowScale, opacity: glowOpacity }}
      />

      <nav className="gradient-footer__navigation" aria-label="Footer navigation">
        <div>
          <p>Explore</p>
          <a href="#research">Research</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#blog">Blog</a>
        </div>
        <div>
          <p>Connect</p>
          <a href="#team">Team</a>
          <a href="#contact">Join the team</a>
          <a href="#sponsors">Sponsors</a>
        </div>
        <div>
          <p>Follow</p>
          <a href="https://github.com/softrobotrl" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://watai.ca" target="_blank" rel="noopener noreferrer">
            WAT.ai
          </a>
          <a href="https://www.linkedin.com/company/wat-ai/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>
      </nav>

      <div className="gradient-footer__meta">
        <div className="gradient-footer__meta-copy">
          <p>Made by the Gradus RL team · {currentYear}</p>
          <p>Epic stuff coming soon.</p>
        </div>
        <a href="#top">Back to top ↑</a>
      </div>

      <motion.p
        className="gradient-footer__wordmark"
        aria-label={wordmark}
        variants={wordmarkVariants}
        initial={reduceMotion ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
      >
        {wordmark.split('').map((letter, index) => (
          <motion.span key={`${letter}-${index}`} aria-hidden="true" variants={letterVariants}>
            {letter === ' ' ? '\u00a0' : letter}
          </motion.span>
        ))}
      </motion.p>
    </footer>
  )
}
