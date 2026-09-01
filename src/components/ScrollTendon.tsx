import { motion, useTransform, type MotionValue } from 'framer-motion'
import { TENDON_STROKE_WIDTH, type TendonGeometry } from './tendonGeometry'

export function ScrollTendon({ progress, geometry }: { progress: MotionValue<number>; geometry: TendonGeometry }) {
  const revealHeight = useTransform(progress, [0, 1], [0, 3200])

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      viewBox="0 0 1440 3200"
      fill="none"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="scroll-tendon-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ff5500" stopOpacity="0.58" />
          <stop offset="0.22" stopColor="#ff5500" stopOpacity="0.84" />
          <stop offset="0.5" stopColor="#ff5500" />
          <stop offset="0.78" stopColor="#ff5500" stopOpacity="0.88" />
          <stop offset="1" stopColor="#ff5500" stopOpacity="0.68" />
        </linearGradient>
        <mask id="scroll-tendon-node-gaps" x="0" y="0" width="1440" height="3200" maskUnits="userSpaceOnUse">
          <rect width="1440" height="3200" fill="white" />
          {geometry.gaps.map((gap, index) => (
            <ellipse key={`${gap.x}-${gap.y}-${index}`} cx={gap.x} cy={gap.y} rx={gap.rx} ry={gap.ry} fill="black" />
          ))}
        </mask>
        <clipPath id="scroll-tendon-progress" clipPathUnits="userSpaceOnUse">
          <motion.rect x="0" y="0" width="1440" height={revealHeight} />
        </clipPath>
        <filter id="scroll-tendon-glow" x="-30%" y="-10%" width="160%" height="120%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
      </defs>
      <path
        d={geometry.path}
        stroke="url(#scroll-tendon-gradient)"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.16"
        filter="url(#scroll-tendon-glow)"
        vectorEffect="non-scaling-stroke"
        mask="url(#scroll-tendon-node-gaps)"
        clipPath="url(#scroll-tendon-progress)"
      />
      <path
        d={geometry.path}
        stroke="url(#scroll-tendon-gradient)"
        strokeWidth={TENDON_STROKE_WIDTH}
        strokeLinecap="butt"
        vectorEffect="non-scaling-stroke"
        mask="url(#scroll-tendon-node-gaps)"
        clipPath="url(#scroll-tendon-progress)"
      />
    </svg>
  )
}
