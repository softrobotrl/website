import { HeroDiagram } from './HeroDiagram'

export function Hero() {
  return (
    <section id="top" className="bg-grid relative overflow-hidden border-b border-border-soft">
      <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs tracking-wide text-ink-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            WAT.AI RESEARCH TEAM · FORMING
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            GradusRL
          </h1>
          <p className="mt-4 text-lg text-ink-dim sm:text-xl">
            Reinforcement learning control policies for a tendon-driven soft
            quadruped robot.
          </p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-faint">
            We're building a soft quadruped with two-segment, independently
            actuated legs, then comparing model-free RL, model-based RL, and
            an algorithmic motion planner in simulation and on hardware.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://github.com/softrobotrl"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition hover:opacity-90"
            >
              View on GitHub
            </a>
            <a
              href="#team"
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink transition hover:border-accent/50"
            >
              Get in touch
            </a>
            <a
              href="#get-involved"
              className="inline-flex items-center px-1 text-sm font-medium text-ink-dim underline decoration-border underline-offset-4 transition hover:text-accent hover:decoration-accent"
            >
              Get involved
            </a>
          </div>
        </div>

        <HeroDiagram />
      </div>
    </section>
  )
}
