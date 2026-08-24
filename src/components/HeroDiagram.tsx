import { useEffect, useRef } from 'react'

// Physical constants (stylized units, tuned for a legible, settled limit
// cycle rather than real-world SI values). The leg is a double pendulum
// hanging from a fixed hip: two point masses at the knee and foot, driven
// by generalized torques standing in for differential tendon tension, and
// solved with real Lagrangian dynamics (mass matrix + Coriolis + gravity),
// integrated with RK4. Only the *rendering* below treats the leg as a soft,
// continuously-curving body rather than two rigid rods.
const L1 = 96
const L2 = 96
const M1 = 1
const M2 = 0.65
const GRAVITY = 340
const DAMP1 = 14000
const DAMP2 = 6000
const LIMIT1 = (26 * Math.PI) / 180
const LIMIT2 = (34 * Math.PI) / 180
const TORQUE1_AMP = 18000
const TORQUE2_AMP = 9500
const FREQ = 0.1
const PHASE = Math.PI / 2.2

const HIP = { x: 160, y: 74 }

// Tendon channel offsets from the leg's centerline. Short tendons (hip to
// knee) route through the inner channel; long tendons (hip to foot) route
// through the outer channel the whole way down. Each side keeps a fixed
// channel for its whole length, so the two pairs never cross.
const OFFSET_SHORT = 13
const OFFSET_LONG = 20

type Vec2 = { x: number; y: number }
type Vec4 = [theta1: number, theta2: number, omega1: number, omega2: number]
type Cubic = { p0: Vec2; p1: Vec2; p2: Vec2; p3: Vec2 }

function derivative(y: Vec4, t: number): Vec4 {
  const [t1, t2, w1, w2] = y

  const drive1 = TORQUE1_AMP * Math.sin(2 * Math.PI * FREQ * t)
  const drive2 = TORQUE2_AMP * Math.sin(2 * Math.PI * FREQ * t + PHASE)

  const c = Math.cos(t1 - t2)
  const s = Math.sin(t1 - t2)

  const M11 = (M1 + M2) * L1 * L1
  const M12 = M2 * L1 * L2 * c
  const M22 = M2 * L2 * L2

  const coriolis1 = M2 * L1 * L2 * s * w2 * w2
  const coriolis2 = -M2 * L1 * L2 * s * w1 * w1

  const gravity1 = (M1 + M2) * GRAVITY * L1 * Math.sin(t1)
  const gravity2 = M2 * GRAVITY * L2 * Math.sin(t2)

  const rhs1 = drive1 - coriolis1 - gravity1 - DAMP1 * w1
  const rhs2 = drive2 - coriolis2 - gravity2 - DAMP2 * w2

  const det = M11 * M22 - M12 * M12
  const alpha1 = (M22 * rhs1 - M12 * rhs2) / det
  const alpha2 = (M11 * rhs2 - M12 * rhs1) / det

  return [w1, w2, alpha1, alpha2]
}

function rk4Step(y: Vec4, t: number, dt: number): Vec4 {
  const add = (a: Vec4, b: Vec4, s: number): Vec4 => [
    a[0] + b[0] * s,
    a[1] + b[1] * s,
    a[2] + b[2] * s,
    a[3] + b[3] * s,
  ]
  const k1 = derivative(y, t)
  const k2 = derivative(add(y, k1, dt / 2), t + dt / 2)
  const k3 = derivative(add(y, k2, dt / 2), t + dt / 2)
  const k4 = derivative(add(y, k3, dt), t + dt)
  return [
    y[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    y[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    y[2] + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    y[3] + (dt / 6) * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]),
  ]
}

// Hard joint limits with a soft bounce, as a safety net around the tuned
// (already well-behaved) dynamics above.
function clampJoints(y: Vec4): Vec4 {
  let [t1, t2, w1, w2] = y
  if (Math.abs(t1) > LIMIT1) {
    t1 = Math.sign(t1) * LIMIT1
    if (Math.sign(w1) === Math.sign(t1)) w1 *= -0.2
  }
  if (Math.abs(t2) > LIMIT2) {
    t2 = Math.sign(t2) * LIMIT2
    if (Math.sign(w2) === Math.sign(t2)) w2 *= -0.2
  }
  return [t1, t2, w1, w2]
}

function rotate90({ x, y }: Vec2): Vec2 {
  return { x: -y, y: x }
}

function normalize({ x, y }: Vec2): Vec2 {
  const len = Math.hypot(x, y) || 1
  return { x: x / len, y: y / len }
}

function add(a: Vec2, b: Vec2, s = 1): Vec2 {
  return { x: a.x + b.x * s, y: a.y + b.y * s }
}

function bezierPoint(c: Cubic, t: number): Vec2 {
  const mt = 1 - t
  const a = mt * mt * mt
  const b = 3 * mt * mt * t
  const cc = 3 * mt * t * t
  const d = t * t * t
  return {
    x: a * c.p0.x + b * c.p1.x + cc * c.p2.x + d * c.p3.x,
    y: a * c.p0.y + b * c.p1.y + cc * c.p2.y + d * c.p3.y,
  }
}

function bezierTangent(c: Cubic, t: number): Vec2 {
  const mt = 1 - t
  const a = 3 * mt * mt
  const b = 6 * mt * t
  const cc = 3 * t * t
  return {
    x: a * (c.p1.x - c.p0.x) + b * (c.p2.x - c.p1.x) + cc * (c.p3.x - c.p2.x),
    y: a * (c.p1.y - c.p0.y) + b * (c.p2.y - c.p1.y) + cc * (c.p3.y - c.p2.y),
  }
}

const OFFSET_SAMPLES = 12

// Samples a curve offset to one side of a segment's centerline (a "channel"
// running parallel to the soft body), used to route tendons so they follow
// the leg's curvature instead of cutting a straight, crossing line.
function sampleOffsetPath(curve: Cubic, offset: number): Vec2[] {
  const pts: Vec2[] = []
  for (let i = 0; i <= OFFSET_SAMPLES; i++) {
    const t = i / OFFSET_SAMPLES
    const p = bezierPoint(curve, t)
    const n = rotate90(normalize(bezierTangent(curve, t)))
    pts.push(add(p, n, offset))
  }
  return pts
}

const ACCENT = '#e8a33d'
const INK_FAINT = '#6d6f78'
const BORDER_SOFT = '#1d2027'
const SURFACE_2 = '#1a1d23'
const LEG_BASE = '#2b2e37'
const LEG_CORE = '#4a4e5c'

export function HeroDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let state: Vec4 = [0.05, -0.05, 0, 0]
    let simTime = 0
    let dashPhase = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(rect.width, 1)
      const h = Math.max(rect.height, 1)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform((dpr * w) / 320, 0, 0, (dpr * h) / 360, 0, 0)
    }

    const strokeCurve = (curve: Cubic, color: string, width: number) => {
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(curve.p0.x, curve.p0.y)
      ctx.bezierCurveTo(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y, curve.p3.x, curve.p3.y)
      ctx.stroke()
    }

    const strokePath = (pts: Vec2[], tension: number) => {
      ctx.save()
      ctx.strokeStyle = ACCENT
      ctx.globalAlpha = 0.35 + 0.55 * tension
      ctx.lineWidth = 1 + 1.1 * tension
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.setLineDash([3, 4])
      ctx.lineDashOffset = -dashPhase * (0.4 + tension)
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
      ctx.stroke()
      ctx.restore()
    }

    const draw = () => {
      const [theta1, theta2] = state

      const dir1 = normalize({ x: Math.sin(theta1), y: Math.cos(theta1) })
      const dir2 = normalize({ x: Math.sin(theta2), y: Math.cos(theta2) })
      const knee = add(HIP, dir1, L1)
      const foot = add(knee, dir2, L2)
      // Shared tangent at the knee keeps the two segments C1-continuous, so
      // the leg reads as one soft curve instead of a hinged rigid joint.
      const dirKnee = normalize({ x: dir1.x + dir2.x, y: dir1.y + dir2.y })

      const handle1 = L1 / 3
      const handle2 = L2 / 3

      const seg1: Cubic = {
        p0: HIP,
        p1: add(HIP, dir1, handle1),
        p2: add(knee, dirKnee, -handle1),
        p3: knee,
      }
      const seg2: Cubic = {
        p0: knee,
        p1: add(knee, dirKnee, handle2),
        p2: add(foot, dir2, -handle2),
        p3: foot,
      }

      const shortL = sampleOffsetPath(seg1, OFFSET_SHORT)
      const shortR = sampleOffsetPath(seg1, -OFFSET_SHORT)
      const longL = [...sampleOffsetPath(seg1, OFFSET_LONG), ...sampleOffsetPath(seg2, OFFSET_LONG)]
      const longR = [...sampleOffsetPath(seg1, -OFFSET_LONG), ...sampleOffsetPath(seg2, -OFFSET_LONG)]

      // Tension ~ instantaneous driving torque direction, for tendon styling.
      const drive1 = TORQUE1_AMP * Math.sin(2 * Math.PI * FREQ * simTime)
      const drive2 = TORQUE2_AMP * Math.sin(2 * Math.PI * FREQ * simTime + PHASE)
      const tensionR1 = 0.5 + 0.5 * Math.max(-1, Math.min(1, drive1 / TORQUE1_AMP))
      const tensionR2 = 0.5 + 0.5 * Math.max(-1, Math.min(1, drive2 / TORQUE2_AMP))

      ctx.clearRect(0, 0, 320, 360)

      // guide circles
      ctx.strokeStyle = BORDER_SOFT
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(160, 200, 150, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(160, 200, 105, 0, Math.PI * 2)
      ctx.stroke()

      strokePath(shortL, 1 - tensionR1)
      strokePath(shortR, tensionR1)
      strokePath(longL, 1 - tensionR2)
      strokePath(longR, tensionR2)

      // soft body: tapered base pass + lighter core pass for a rounded,
      // silicone-like read instead of a thin rigid line.
      strokeCurve(seg1, LEG_BASE, 20)
      strokeCurve(seg2, LEG_BASE, 14)
      strokeCurve(seg1, LEG_CORE, 8)
      strokeCurve(seg2, LEG_CORE, 5.5)

      // tendon anchors on the body
      ctx.fillStyle = ACCENT
      for (const p of [shortL[0], shortR[0], longL[0], longR[0]]) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      // body
      ctx.fillStyle = SURFACE_2
      ctx.strokeStyle = '#262931'
      ctx.lineWidth = 1.5
      const bodyRect = { x: 120, y: 40, w: 80, h: 34, r: 8 }
      ctx.beginPath()
      ctx.roundRect(bodyRect.x, bodyRect.y, bodyRect.w, bodyRect.h, bodyRect.r)
      ctx.fill()
      ctx.stroke()

      // knee joint
      ctx.fillStyle = ACCENT
      ctx.beginPath()
      ctx.arc(knee.x, knee.y, 4.5, 0, Math.PI * 2)
      ctx.fill()

      // foot
      ctx.fillStyle = SURFACE_2
      ctx.strokeStyle = ACCENT
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(foot.x, foot.y, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // labels
      ctx.fillStyle = INK_FAINT
      ctx.font = '10px "JetBrains Mono", ui-monospace, monospace'
      ctx.textAlign = 'center'
      ctx.fillText('BODY', 160, 30)
      ctx.textAlign = 'left'
      ctx.fillText('segment 1', 228, 120)
      ctx.fillText('segment 2', 228, 222)
      ctx.textAlign = 'center'
      ctx.fillStyle = ACCENT
      ctx.fillText('2 SEGMENTS · 4 TENDONS', 160, 305)
    }

    const resizeAndDraw = () => {
      resize()
      draw()
    }

    const observer = new ResizeObserver(resizeAndDraw)
    observer.observe(canvas)
    // Defer the first draw a frame so layout has settled (getBoundingClientRect
    // can still report a zero-size box synchronously on mount).
    requestAnimationFrame(resizeAndDraw)

    if (reduceMotion) {
      return () => observer.disconnect()
    }

    let raf = 0
    let last = performance.now()
    const dt = 1 / 240
    let accumulator = 0

    const loop = (now: number) => {
      const frameDt = Math.min((now - last) / 1000, 1 / 20)
      last = now
      accumulator += frameDt
      while (accumulator >= dt) {
        state = clampJoints(rk4Step(state, simTime, dt))
        simTime += dt
        accumulator -= dt
      }
      dashPhase += frameDt * 24
      draw()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="mx-auto block h-auto w-full max-w-[280px]"
      style={{ aspectRatio: '320 / 360' }}
    />
  )
}
