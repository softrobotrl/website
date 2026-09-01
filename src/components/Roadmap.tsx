import { ScrollInstrument, type InstrumentVariant } from './ScrollInstrument'
import { MaskedHeading } from './MaskedHeading'

const phases = [
  {
    when: 'Fall 2026',
    title: 'Single leg',
    body: 'CAD, build, and bench-test a single two-segment tendon-driven leg. Train and evaluate RL policies on it in simulation and in real life.',
    active: true,
    visual: 'flow' as InstrumentVariant,
  },
  {
    when: 'Winter 2027',
    title: 'Full quadruped',
    body: 'Scale to four independently actuated legs, train locomotion policies, and write up findings for CUCAI.',
    active: false,
    visual: 'layers' as InstrumentVariant,
  },
]

export function Roadmap() {
  return (
    <section id="roadmap" className="section-panel--dark border-b border-border-soft bg-bg py-28 sm:py-36">
      <div className="section-shell">
        <MaskedHeading lines={['Roadmap']} className="roadmap-heading section-title text-ink" />

        <ol className="mt-20 border-t border-border">
          {phases.map((p, index) => (
            <li key={p.title} className="roadmap-phase grid gap-5 border-b border-border py-8">
              <span
                className={`roadmap-phase__index ${p.active ? 'text-2xl font-medium text-accent' : 'text-2xl font-medium text-ink-faint'}`}
              >
                0{index + 1}
              </span>
              <p className="roadmap-phase__when text-sm text-ink-faint">{p.when}</p>
              <h3 className="roadmap-phase__title text-xl font-medium tracking-[-0.02em] text-ink">{p.title}</h3>
              <p className="roadmap-phase__body max-w-xl text-sm leading-7 text-ink-dim">{p.body}</p>
              <ScrollInstrument
                variant={p.visual}
                ariaLabel={
                  p.title === 'Single leg'
                    ? 'Animated single-leg control surface'
                    : 'Animated full-quadruped control layers'
                }
                tone="orange"
                className="roadmap-phase__instrument scroll-instrument--compact"
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
