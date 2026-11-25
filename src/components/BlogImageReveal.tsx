import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import benchSessionImage from '../assets/blog/bench-session.webp'
import buildLogImage from '../assets/blog/build-log.webp'
import policyRolloutPoster from '../assets/blog/policy-rollout-poster.webp'
import policyRolloutVideo from '../assets/blog/policy-rollout.mp4'
import quadrupedWalkPoster from '../assets/blog/quadruped-walk-poster.webp'
import quadrupedWalkVideo from '../assets/blog/quadruped-walk.mp4'

type CardPosition = {
  x: number
  y: number
  rotate: number
  hoverX: number
  hoverY: number
  hoverRotate: number
}

// Card centres as multiples of card width: 0.9 apart, so neighbours overlap by about 10% at every desktop size.
const desktopLayout = [
  { offset: -1.35, y: 14, rotate: -7, hoverY: 2, hoverRotate: -2 },
  { offset: -0.45, y: 0, rotate: 5, hoverY: -9, hoverRotate: 1 },
  { offset: 0.45, y: 18, rotate: -5, hoverY: 6, hoverRotate: -1 },
  { offset: 1.35, y: 4, rotate: 6, hoverY: -6, hoverRotate: 2 },
]

function desktopPositions(cardWidth: number): CardPosition[] {
  return desktopLayout.map(({ offset, y, rotate, hoverY, hoverRotate }) => ({
    x: offset * cardWidth,
    y,
    rotate,
    hoverX: offset * cardWidth * 1.03,
    hoverY,
    hoverRotate,
  }))
}

const compactPositions: CardPosition[] = [
  { x: -76, y: 8, rotate: -7, hoverX: -80, hoverY: 1, hoverRotate: -2 },
  { x: 0, y: 0, rotate: 5, hoverX: 0, hoverY: -7, hoverRotate: 1 },
  { x: 76, y: 12, rotate: -5, hoverX: 80, hoverY: 5, hoverRotate: 2 },
  { x: 152, y: 4, rotate: 6, hoverX: 156, hoverY: -3, hoverRotate: 2 },
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

/** Mirrors the desktop .blog-reveal-card width: clamp(14rem, 24vw, 19rem). */
function useDesktopCardWidth() {
  const read = () => Math.min(304, Math.max(224, window.innerWidth * 0.24))
  const [width, setWidth] = useState(read)

  useEffect(() => {
    const update = () => setWidth(read())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return width
}

function useCompactLayout() {
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 899px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 899px)')
    const update = () => setCompact(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return compact
}

type BlogMedia =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string; poster: string; alt: string; fit: 'cover' | 'contain' }

const posts: { index: string; title: string; fullTitle?: string; category: string; media: BlogMedia }[] = [
  {
    index: '01',
    title: 'Leg assembly',
    category: 'Hardware',
    media: {
      kind: 'image',
      src: benchSessionImage,
      alt: 'Team member fitting a printed part onto an orange rod, with leg components and wiring spread across the table',
    },
  },
  {
    index: '02',
    title: 'Single leg prototype',
    category: 'Hardware',
    media: {
      kind: 'image',
      src: buildLogImage,
      alt: 'Five black 3D-printed leg segments threaded onto an orange rod on a workbench',
    },
  },
  {
    index: '03',
    title: 'Trained leg policy',
    fullTitle: 'Single leg trained policy in simulation',
    category: 'Simulation',
    media: {
      kind: 'video',
      src: policyRolloutVideo,
      poster: policyRolloutPoster,
      alt: 'Side-by-side simulation of a single tendon-driven leg: the cloned starting policy versus the policy after 100 RL iterations',
      fit: 'contain',
    },
  },
  {
    index: '04',
    title: 'Simulated quadruped',
    category: 'Simulation',
    media: {
      kind: 'video',
      src: quadrupedWalkVideo,
      poster: quadrupedWalkPoster,
      alt: 'Simulated four-legged soft robot with tendon-driven legs walking across a checkered floor',
      fit: 'cover',
    },
  },
]

/** Muted looping video that only plays while on screen, and never autoplays under reduced motion. */
function InViewVideo({
  media,
  className,
  controls = false,
}: {
  media: Extract<BlogMedia, { kind: 'video' }>
  className?: string
  controls?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const video = ref.current
    if (!video || reducedMotion) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.25 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <video
      ref={ref}
      className={className}
      src={media.src}
      poster={media.poster}
      aria-label={media.alt}
      muted
      loop
      playsInline
      preload="metadata"
      controls={controls || Boolean(reducedMotion)}
    />
  )
}

function MediaView({ media, className, controls }: { media: BlogMedia; className?: string; controls?: boolean }) {
  if (media.kind === 'image') {
    return <img className={className} src={media.src} alt={media.alt} loading="lazy" decoding="async" />
  }
  return <InViewVideo media={media} className={className} controls={controls} />
}

export function BlogImageReveal() {
  const reducedMotion = useReducedMotion()
  const compact = useCompactLayout()
  const cardWidth = useDesktopCardWidth()
  const positions = compact ? compactPositions : desktopPositions(cardWidth)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const openPost = openIndex === null ? null : posts[openIndex]

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (openIndex !== null && !dialog.open) dialog.showModal()
    if (openIndex === null && dialog.open) dialog.close()
  }, [openIndex])

  return (
    <>
      <figure
        className="blog-image-reveal"
        aria-label="Project media: build photos and simulation clips"
        tabIndex={compact ? 0 : undefined}
      >
        {posts.map((post, index) => (
          <motion.div
            key={post.title}
            className="blog-reveal-card"
            variants={compact ? undefined : cardVariants(positions[index], index)}
            initial={compact ? false : reducedMotion ? 'animate' : 'initial'}
            animate={!compact && reducedMotion ? 'animate' : undefined}
            whileInView={compact || reducedMotion ? undefined : 'animate'}
            whileHover={compact || reducedMotion ? undefined : 'hover'}
            viewport={{ once: true, amount: 0.45 }}
            style={{ zIndex: index + 1 }}
          >
            <div className="blog-placeholder">
              <div className="blog-placeholder__meta">
                <span>{post.title}</span>
                <span>{post.index}</span>
              </div>
              <div
                className={`blog-card-media blog-card-media--${post.media.kind === 'video' ? post.media.fit : 'cover'}`}
              >
                <MediaView media={post.media} />
              </div>
              <div className="blog-placeholder__footer">
                <span>{post.category}</span>
                <span>{post.media.kind === 'video' ? 'Video' : 'Photo'}</span>
              </div>
              <button
                type="button"
                className="blog-card-open"
                aria-label={`View ${post.fullTitle ?? post.title} larger`}
                onClick={() => setOpenIndex(index)}
              />
            </div>
          </motion.div>
        ))}
      </figure>
      <p className="blog-coming-soon">Blog posts coming soon.</p>

      <dialog
        ref={dialogRef}
        className="blog-lightbox"
        aria-label={openPost ? (openPost.fullTitle ?? openPost.title) : 'Media viewer'}
        onClose={() => setOpenIndex(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpenIndex(null)
        }}
      >
        {openPost && (
          <div className="blog-lightbox__panel">
            <div className="blog-lightbox__bar">
              <span>
                {openPost.index} / {openPost.fullTitle ?? openPost.title} / {openPost.category}
              </span>
              <button type="button" className="blog-lightbox__close" onClick={() => setOpenIndex(null)}>
                Close
              </button>
            </div>
            <MediaView media={openPost.media} className="blog-lightbox__media" controls />
          </div>
        )}
      </dialog>
    </>
  )
}
