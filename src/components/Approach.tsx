const points = [
  {
    label: '01',
    title: 'Two-segment legs',
    body: 'Each leg is independently actuated across two segments, removing the diagonal-pair synchrony that simplified prior soft quadrupeds.',
  },
  {
    label: '02',
    title: 'Three controllers, one benchmark',
    body: 'Model-free RL, model-based RL, and a classical motion planner are evaluated head-to-head on the same robot.',
  },
  {
    label: '03',
    title: 'Simulation and hardware',
    body: 'Policies are trained and scored in simulation, then validated on a physical tendon-driven quadruped.',
  },
]

export function Approach() {
  return (
    <section id="approach" className="border-b border-border-soft">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <p className="font-mono text-xs tracking-widest text-accent">APPROACH</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          What makes this different
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {points.map((p) => (
            <div key={p.label} className="rounded-xl border border-border bg-surface p-6">
              <span className="font-mono text-xs text-ink-faint">{p.label}</span>
              <h3 className="mt-3 text-base font-medium text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-dim">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
