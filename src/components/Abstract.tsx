export function Abstract() {
  return (
    <section id="research" className="border-b border-border-soft">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <p className="font-mono text-xs tracking-widest text-accent">RESEARCH</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Reinforcement Learning Control Policies for a Tendon-Driven Soft
          Quadruped Robot
        </h2>

        <div className="mt-8 rounded-xl border border-border bg-surface p-6 sm:p-8">
          <p className="font-mono text-xs tracking-widest text-ink-faint">ABSTRACT</p>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-ink-dim">
            In this paper, we attempt to train a reinforcement learning model
            to control a tendon-driven soft quadruped robot. Soft robotics
            control still has many areas of development, with problems
            including the high computation requirements of simulation and the
            sim-to-real gap. While previous studies train an RL model on a
            soft-robot quadruped, we intend to expand on this research with
            two-segmented legs and remove the paired-leg restriction that was
            placed. We will compare the effectiveness of model-free RL,
            model-based RL, and an algorithmic motion planner, both in
            simulation and on a physical robot.
          </p>
        </div>
      </div>
    </section>
  )
}
