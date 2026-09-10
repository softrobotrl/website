import { ScrollInstrument } from './ScrollInstrument'
import { MaskedHeading } from './MaskedHeading'

export function Abstract() {
  return (
    <section id="research" className="section-panel--light border-b py-28 sm:py-36">
      <div className="section-shell research-layout">
        <div>
          <MaskedHeading lines={['Research']} className="section-title text-ink" />
          <p className="body-copy mt-8">
            We are training reinforcement learning models to control a tendon-driven soft quadruped robot. The project
            uses two-segment, independently actuated legs and compares model-free RL, model-based RL, and an algorithmic
            motion planner in simulation and on physical hardware.
          </p>
        </div>

        <div
          className="research-instruments research-bench"
          aria-label="Animated design concept of a tendon-driven leg"
        >
          <div className="research-bench__leg">
            <ScrollInstrument
              variant="leg"
              ariaLabel="Tendon-driven soft leg concept with servo winches, cable guides, two flexible segments, and a foot"
            />
            <ul className="research-bench__parts" aria-label="Leg components">
              <li>Servo winches</li>
              <li>Cable guides</li>
              <li>Flexible backbone</li>
            </ul>
            <p>
              Two-segment leg <span>Design concept</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
