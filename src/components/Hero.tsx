import { motion, useReducedMotion } from 'framer-motion'
import watAiLogo from '../assets/wat-ai-logo.png'
import { MaskedHeading } from './MaskedHeading'
import { ScrollInstrument } from './ScrollInstrument'
import { ScrambleText } from './ScrambleText'

export function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden bg-bg">
      <div className="relative z-20 mx-auto flex min-h-[100svh] max-w-[84rem] items-center justify-center px-5 pb-16 pt-28 sm:px-8 lg:px-12">
        <div className="hero-layout">
          <div className="hero-copy">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="hero-badge mb-7 inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-medium text-ink-dim"
            >
              <a
                href="https://watai.ca"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit the WAT.ai website"
                className="inline-flex transition-opacity duration-150 hover:opacity-80"
              >
                <img src={watAiLogo} alt="WAT.ai" width="70" height="24" decoding="async" className="h-6 w-auto" />
              </a>
              <span>research team</span>
            </motion.div>

            <MaskedHeading
              as="h1"
              lines={['Gradus RL']}
              reveal="load"
              delay={0.12}
              className="max-w-[12ch] text-[clamp(3.75rem,14vw,6rem)] font-[560] leading-[0.92] tracking-[-0.04em] text-ink"
            />
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, filter: 'blur(5px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.65, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 max-w-[38rem] text-[clamp(1.05rem,2vw,1.3rem)] leading-relaxed text-ink-dim"
            >
              Reinforcement learning control policies for a tendon-driven soft quadruped robot.
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="hero-actions mt-9 flex flex-wrap items-center gap-3"
            >
              <a
                href="https://github.com/softrobotrl"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-[background-color] duration-150 hover:bg-accent-light"
              >
                <ScrambleText trigger="hover" hoverTarget="parent" noiseColor="var(--color-accent-ink)">
                  View on GitHub
                </ScrambleText>
              </a>
              <a
                href="#contact"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-ink transition-colors duration-150 hover:border-accent"
              >
                <ScrambleText trigger="hover" hoverTarget="parent">
                  Join the team
                </ScrambleText>
              </a>
            </motion.div>
          </div>

          <ScrollInstrument
            variant="sphere"
            ariaLabel="Animated connected research system"
            className="hero-instrument"
            forceActive
            pointerReactive
          />
        </div>
      </div>

      <a className="hero-scroll-cue" href="#research" aria-label="Scroll to research">
        <ScrambleText trigger="hover" hoverTarget="parent">
          Scroll
        </ScrambleText>
        <span className="hero-scroll-cue__line" aria-hidden="true" />
      </a>
    </section>
  )
}
