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

        <div className="research-instruments">
          <ScrollInstrument variant="cylinders" ariaLabel="Animated tendon-driven joint system" />
          <ScrollInstrument variant="nodes" ariaLabel="Animated coordinated control nodes" />
        </div>
      </div>
    </section>
  )
}
