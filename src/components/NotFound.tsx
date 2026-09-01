import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect } from 'react'
import { homeHref, homeSectionHref } from '../sitePath'
import { TendonMark } from './TendonMark'

const digits = ['4', '0', '4']

const numberVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.09,
    },
  },
}

const digitVariants: Variants = {
  hidden: { opacity: 0, y: '0.18em', filter: 'blur(7px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.68, ease: [0.16, 1, 0.3, 1] },
  },
}

export function NotFound() {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const previousTitle = document.title
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const previousDescription = description?.content
    const previousRobots = robots?.content

    document.title = '404 | Gradus RL'
    if (description) description.content = 'The requested Gradus RL page could not be found.'
    if (robots) robots.content = 'noindex, nofollow'

    return () => {
      document.title = previousTitle
      if (description && previousDescription !== undefined) description.content = previousDescription
      if (robots && previousRobots !== undefined) robots.content = previousRobots
    }
  }, [])

  return (
    <main className="not-found-page">
      <svg className="not-found-page__route" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-80 760 C230 760 300 610 505 610 C645 610 652 478 716 454" />
        <path d="M758 426 C826 388 858 250 1032 250 C1200 250 1260 120 1520 120" />
        <circle cx="505" cy="610" r="7" />
        <circle cx="1032" cy="250" r="7" />
        <circle className="not-found-page__route-end" cx="716" cy="454" r="9" />
        <circle className="not-found-page__route-end" cx="758" cy="426" r="9" />
      </svg>

      <a className="not-found-page__brand" href={homeHref} aria-label="Gradus RL home">
        <TendonMark className="not-found-page__brand-mark" />
        <span>Gradus RL</span>
      </a>

      <section className="not-found-page__content" aria-labelledby="not-found-title">
        <motion.h1
          id="not-found-title"
          className="not-found-page__code"
          aria-label="404 — page not found"
          variants={numberVariants}
          initial={reduceMotion ? 'visible' : 'hidden'}
          animate="visible"
        >
          {digits.map((digit, index) => (
            <motion.span key={`${digit}-${index}`} aria-hidden="true" variants={digitVariants}>
              {digit}
            </motion.span>
          ))}
        </motion.h1>

        <p className="not-found-page__lead">That route ends here.</p>
        <p className="not-found-page__description">
          The page you’re looking for may have moved, or the path no longer exists.
        </p>

        <div className="not-found-page__actions">
          <a className="not-found-page__action not-found-page__action--primary" href={homeHref}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 9.2 10 3l7 6.2v7.3H12v-4H8v4H3z" />
            </svg>
            Back home
          </a>
          <a className="not-found-page__action not-found-page__action--secondary" href={homeSectionHref('research')}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r="7" />
              <path d="m12.8 7.2-1.6 4-4 1.6 1.6-4z" />
            </svg>
            Explore the project
          </a>
        </div>
      </section>

      <p className="not-found-page__meta">WAT.ai · University of Waterloo</p>
    </main>
  )
}
