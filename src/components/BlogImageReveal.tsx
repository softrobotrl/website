import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
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

const posts: { index: string; title: string; category: string; media: BlogMedia }[] = [
  {
    index: '01',
    title: 'Build log',
    category: 'Hardware',
    media: {
      kind: 'image',
      src: buildLogImage,
      alt: 'Five black 3D-printed leg segments threaded onto an orange rod on a workbench',
    },
  },
  {
    index: '02',
    title: 'Policy rollout',
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
    index: '03',
    title: 'Field notes',
    category: 'Quadruped',
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
  const positions = compact ? compactPositions : desktopPositions
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
        aria-label="Project media: build photo and simulation clips"
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
            style={{ zIndex: posts.length - index }}
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
                <span>Coming soon</span>
              </div>
              <button
                type="button"
                className="blog-card-open"
                aria-label={`View ${post.title} larger`}
                onClick={() => setOpenIndex(index)}
              />
            </div>
          </motion.div>
        ))}
      </figure>

      <dialog
        ref={dialogRef}
        className="blog-lightbox"
        aria-label={openPost ? openPost.title : 'Media viewer'}
        onClose={() => setOpenIndex(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpenIndex(null)
        }}
      >
        {openPost && (
          <div className="blog-lightbox__panel">
            <div className="blog-lightbox__bar">
              <span>
                {openPost.index} / {openPost.title} / {openPost.category}
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
