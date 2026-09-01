import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect, useState } from 'react'

type CardPosition = {
  x: number
  y: number
  rotate: number
  hoverX: number
  hoverY: number
  hoverRotate: number
}

const desktopPositions: CardPosition[] = [
  { x: -244, y: 12, rotate: -8, hoverX: -252, hoverY: 0, hoverRotate: -2 },
  { x: 0, y: 0, rotate: 6, hoverX: 0, hoverY: -9, hoverRotate: 1 },
  { x: 252, y: 20, rotate: -6, hoverX: 260, hoverY: 7, hoverRotate: 2 },
]

const compactPositions: CardPosition[] = [
  { x: -76, y: 8, rotate: -7, hoverX: -80, hoverY: 1, hoverRotate: -2 },
  { x: 0, y: 0, rotate: 5, hoverX: 0, hoverY: -7, hoverRotate: 1 },
  { x: 76, y: 12, rotate: -5, hoverX: 80, hoverY: 5, hoverRotate: 2 },
]

function cardVariants(position: CardPosition, index: number): Variants {
  return {
    initial: { opacity: 0.01, x: 0, y: 8, rotate: 0, scale: 0.98 },
    animate: {
      opacity: 1,
      x: position.x,
      y: position.y,
      rotate: position.rotate,
      scale: 1,
      transition: { type: 'spring', stiffness: 115, damping: 18, mass: 0.78, delay: 0.08 + index * 0.08 },
    },
    hover: {
      x: position.hoverX,
      y: position.hoverY,
      rotate: position.hoverRotate,
      scale: 1.015,
      transition: { type: 'spring', stiffness: 240, damping: 22, mass: 0.65 },
    },
  }
}

function useCompactLayout() {
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 799px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 799px)')
    const update = () => setCompact(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return compact
}

const placeholders = [
  {
    index: '01',
    title: 'Build log',
    category: 'Hardware',
    drawing: (
      <svg viewBox="0 0 180 124" aria-hidden="true">
        <g className="blog-placeholder__wireframe-faint">
          <path d="m46 38 43-21 46 25-44 23Z" />
          <path d="m46 38 3 48 43 22-1-43M135 42l-2 45-41 21" />
          <path d="m49 86 42-21 42 22M89 17l3 91" />
        </g>
        <path d="M46 38 92 108M135 42 49 86M89 17l44 70M46 38l87 49M89 17 49 86m86-44-43 66" />
        <path className="blog-placeholder__accent-stroke" d="m46 38 43-21 46 25M49 86l43 22 41-21" />
        <circle cx="46" cy="38" r="3" />
        <circle cx="89" cy="17" r="3" className="blog-placeholder__accent-fill" />
        <circle cx="135" cy="42" r="3" />
        <circle cx="49" cy="86" r="3" />
        <circle cx="92" cy="108" r="3" />
        <circle cx="133" cy="87" r="3" className="blog-placeholder__accent-fill" />
      </svg>
    ),
  },
  {
    index: '02',
    title: 'Policy rollout',
    category: 'Simulation',
    drawing: (
      <svg viewBox="0 0 180 124" aria-hidden="true">
        <g className="blog-placeholder__wireframe-faint">
          <path d="m90 13 34 18 19 32-14 35-39 15-38-15-15-35 19-32Z" />
          <path d="m56 31 34 82 34-82-72 67 91-35-106 0 92 35-73-67" />
          <path d="m90 35 21 12 8 22-14 20-27 1-17-21 8-22Z" />
        </g>
        <path d="M90 13 61 69l68 29M143 63 69 47l21 66M52 98l59-51 18 51M37 63l68 26 19-58" />
        <path className="blog-placeholder__accent-stroke" d="m56 31 68 0 19 32-14 35M52 98l-15-35" />
        <circle cx="90" cy="13" r="3" />
        <circle cx="56" cy="31" r="3" className="blog-placeholder__accent-fill" />
        <circle cx="124" cy="31" r="3" />
        <circle cx="143" cy="63" r="3" />
        <circle cx="129" cy="98" r="3" className="blog-placeholder__accent-fill" />
        <circle cx="90" cy="113" r="3" />
        <circle cx="52" cy="98" r="3" />
        <circle cx="37" cy="63" r="3" />
      </svg>
    ),
  },
  {
    index: '03',
    title: 'Field notes',
    category: 'Quadruped',
    drawing: (
      <svg viewBox="0 0 180 124" aria-hidden="true">
        <g className="blog-placeholder__wireframe-faint">
          <ellipse cx="90" cy="45" rx="49" ry="19" />
          <ellipse cx="90" cy="78" rx="49" ry="19" />
          <path d="M41 45v33M139 45v33M55 33v57M75 27v69M105 27v69M125 33v57" />
          <ellipse cx="90" cy="62" rx="24" ry="49" transform="rotate(90 90 62)" />
          <ellipse cx="90" cy="62" rx="18" ry="49" transform="rotate(-31 90 62)" />
        </g>
        <ellipse cx="90" cy="45" rx="49" ry="19" />
        <ellipse cx="90" cy="78" rx="49" ry="19" />
        <path d="M41 45v33M139 45v33M55 33v57M75 27v69M105 27v69M125 33v57" />
        <path className="blog-placeholder__accent-stroke" d="M41 45c17 17 81 20 98 0M41 78c19-16 79-18 98 0" />
        <circle cx="41" cy="45" r="3" />
        <circle cx="139" cy="45" r="3" className="blog-placeholder__accent-fill" />
        <circle cx="41" cy="78" r="3" className="blog-placeholder__accent-fill" />
        <circle cx="139" cy="78" r="3" />
      </svg>
    ),
  },
]

export function BlogImageReveal() {
  const reducedMotion = useReducedMotion()
  const compact = useCompactLayout()
  const positions = compact ? compactPositions : desktopPositions

  return (
    <figure className="blog-image-reveal" aria-label="Three forthcoming blog image placeholders">
      {placeholders.map((placeholder, index) => (
        <motion.div
          key={placeholder.title}
          className="blog-reveal-card"
          variants={cardVariants(positions[index], index)}
          initial={reducedMotion ? 'animate' : 'initial'}
          animate={reducedMotion ? 'animate' : undefined}
          whileInView={reducedMotion ? undefined : 'animate'}
          whileHover={reducedMotion ? undefined : 'hover'}
          viewport={{ once: true, amount: 0.45 }}
          style={{ zIndex: placeholders.length - index }}
        >
          <div className="blog-placeholder">
            <div className="blog-placeholder__meta">
              <span>{placeholder.title}</span>
              <span>{placeholder.index}</span>
            </div>
            {placeholder.drawing}
            <div className="blog-placeholder__footer">
              <span>{placeholder.category}</span>
              <span>Coming soon</span>
            </div>
          </div>
        </motion.div>
      ))}
    </figure>
  )
}
