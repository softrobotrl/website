// Two-segment tendon-driven leg, simulated as a double pendulum hanging from a
// fixed hip: two point masses, real Lagrangian dynamics (mass matrix + Coriolis
// + gravity + damping), driven by torques standing in for differential tendon
// tension and integrated with RK4. The renderer treats the result as a soft,
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

const HIP = { x: 0, y: -100 }
const OFFSET_SHORT = 18
const OFFSET_LONG = 27
const OFFSET_SAMPLES = 12
const RIB_STATIONS = 7
// Physics runs in its own tuned units; this only sizes the drawing to the
// instrument's ~250-unit design space.
const DISPLAY_SCALE = 1.2

const STEP = 1 / 240
const SETTLE_TIME = 2.6

export type Vec2 = { x: number; y: number }
type Vec4 = [theta1: number, theta2: number, omega1: number, omega2: number]

export type LegGeometry = {
  mount: [Vec2, Vec2]
  spine: Vec2[]
  ribs: Array<[Vec2, Vec2]>
  tendons: Array<{ points: Vec2[]; tension: number }>
  joints: Vec2[]
  anchors: Vec2[]
}

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

  return [w1, w2, (M22 * rhs1 - M12 * rhs2) / det, (M11 * rhs2 - M12 * rhs1) / det]
}

function rk4Step(y: Vec4, t: number, dt: number): Vec4 {
  const shift = (a: Vec4, b: Vec4, s: number): Vec4 => [
    a[0] + b[0] * s,
    a[1] + b[1] * s,
    a[2] + b[2] * s,
    a[3] + b[3] * s,
  ]
  const k1 = derivative(y, t)
  const k2 = derivative(shift(y, k1, dt / 2), t + dt / 2)
  const k3 = derivative(shift(y, k2, dt / 2), t + dt / 2)
  const k4 = derivative(shift(y, k3, dt), t + dt)
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

// A constant-curvature arc: the standard piecewise-constant-curvature model
// for a tendon-driven continuum segment. Angles are measured from straight
// down, so a segment's base tangent is what clamps it to its mount.
type Arc = { origin: Vec2; phi0: number; kappa: number; length: number }

const STRAIGHT = 1e-6

function makeArc(origin: Vec2, phi0: number, bend: number, length: number): Arc {
  return { origin, phi0, kappa: bend / length, length }
}

const arcAngle = (arc: Arc, s: number) => arc.phi0 + arc.kappa * s

function arcPoint(arc: Arc, s: number): Vec2 {
  const { origin, phi0, kappa } = arc
  if (Math.abs(kappa) < STRAIGHT) {
    return { x: origin.x + Math.sin(phi0) * s, y: origin.y + Math.cos(phi0) * s }
  }
  const phi = phi0 + kappa * s
  return {
    x: origin.x + (Math.cos(phi0) - Math.cos(phi)) / kappa,
    y: origin.y + (Math.sin(phi) - Math.sin(phi0)) / kappa,
  }
}

// A parallel offset of the spine: the channel a tendon runs through. Routing
// tendons this way keeps each one on its own side of the leg instead of
// cutting a straight line that crosses the body when the leg curves. At s = 0
// the base tangent is fixed, so a tendon's top end never moves.
function sampleArc(arc: Arc, offset: number, samples = OFFSET_SAMPLES): Vec2[] {
  const pts: Vec2[] = []
  for (let i = 0; i <= samples; i += 1) {
    const s = (i / samples) * arc.length
    const p = arcPoint(arc, s)
    const phi = arcAngle(arc, s)
    pts.push({ x: p.x - Math.cos(phi) * offset, y: p.y + Math.sin(phi) * offset })
  }
  return pts
}

function pathLength(pts: Vec2[]): number {
  let len = 0
  for (let i = 1; i < pts.length; i += 1) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
  return len
}

// On the concave side of a bend the offset path is literally shorter, which is
// what a tendon being pulled in looks like, so brightness follows measured arc
// length rather than the commanded torque (which lags the visible pose).
const tensionFromLengths = (lenR: number, lenL: number) => 0.5 - 0.5 * Math.tanh((lenR - lenL) * 0.08)

export function createLegSimulation() {
  let state: Vec4 = [0.05, -0.05, 0, 0]
  let simTime = 0
  let accumulator = 0

  const step = () => {
    state = clampJoints(rk4Step(state, simTime, STEP))
    simTime += STEP
  }

  // Pre-settle so the first painted frame already shows a curved, mid-stride
  // pose instead of a straight leg, including under reduced motion.
  while (simTime < SETTLE_TIME) step()

  return {
    advance(delta: number) {
      accumulator += Math.max(0, Math.min(0.25, delta))
      while (accumulator >= STEP) {
        step()
        accumulator -= STEP
      }
    },
    geometry(): LegGeometry {
      const [theta1, theta2] = state
      // Segment 1's base tangent is pinned to 0 (straight down, square to the
      // mount plate), so the limb never pivots at its root the way a hinged
      // link would. Both joint angles instead become bend accumulated along
      // each segment's arc length, and segment 2 inherits segment 1's exit
      // tangent, which keeps the whole spine smooth.
      const arc1 = makeArc(HIP, 0, theta1, L1)
      const knee = arcPoint(arc1, L1)
      const arc2 = makeArc(knee, theta1, theta2 - theta1, L2)
      const foot = arcPoint(arc2, L2)

      const shortL = sampleArc(arc1, OFFSET_SHORT)
      const shortR = sampleArc(arc1, -OFFSET_SHORT)
      const longL = [...sampleArc(arc1, OFFSET_LONG), ...sampleArc(arc2, OFFSET_LONG)]
      const longR = [...sampleArc(arc1, -OFFSET_LONG), ...sampleArc(arc2, -OFFSET_LONG)]

      const shortTension = tensionFromLengths(pathLength(shortR), pathLength(shortL))
      const longTension = tensionFromLengths(pathLength(longR), pathLength(longL))

      const spine: Vec2[] = []
      const ribs: Array<[Vec2, Vec2]> = []
      for (const [index, arc] of [arc1, arc2].entries()) {
        const samples = sampleArc(arc, 0)
        spine.push(...(index === 0 ? samples : samples.slice(1)))
        for (let i = 0; i < RIB_STATIONS; i += 1) {
          const s = ((i + 0.5) / RIB_STATIONS) * arc.length
          const p = arcPoint(arc, s)
          const phi = arcAngle(arc, s)
          const half = 15 - (index * RIB_STATIONS + i) * 0.54
          ribs.push([
            { x: p.x - Math.cos(phi) * half, y: p.y + Math.sin(phi) * half },
            { x: p.x + Math.cos(phi) * half, y: p.y - Math.sin(phi) * half },
          ])
        }
      }

      const fit = (p: Vec2): Vec2 => ({ x: p.x * DISPLAY_SCALE, y: p.y * DISPLAY_SCALE })

      return {
        mount: [fit({ x: HIP.x - 34, y: HIP.y }), fit({ x: HIP.x + 34, y: HIP.y })],
        spine: spine.map(fit),
        ribs: ribs.map(([a, b]) => [fit(a), fit(b)] as [Vec2, Vec2]),
        tendons: [
          { points: shortL.map(fit), tension: 1 - shortTension },
          { points: shortR.map(fit), tension: shortTension },
          { points: longL.map(fit), tension: 1 - longTension },
          { points: longR.map(fit), tension: longTension },
        ],
        joints: [HIP, knee, foot].map(fit),
        anchors: [shortL[0], shortR[0], longL[0], longR[0]].map(fit),
      }
    },
  }
}
