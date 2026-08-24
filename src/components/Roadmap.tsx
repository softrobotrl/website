const phases = [
  {
    tag: 'Phase 1',
    when: 'Fall 2026',
    title: 'Single leg',
    body: 'CAD, build, and bench-test a single two-segment tendon-driven leg. Train and evaluate RL policies on it in simulation and in real life.',
    active: true,
  },
  {
    tag: 'Phase 2',
    when: 'Winter 2027',
    title: 'Full quadruped',
    body: 'Scale to four independently actuated legs, train locomotion policies, and write up findings for CUCAI.',
    active: false,
  },
]

export function Roadmap() {
  return (
    <section id="roadmap" className="border-b border-border-soft">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <p className="font-mono text-xs tracking-widest text-accent">ROADMAP</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Two phases, single leg first
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-ink-dim">
          We're keeping this deliberately incremental — a working, well
          characterized single leg before scaling to four.
        </p>

        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {phases.map((p) => (
            <div key={p.tag} className="bg-surface p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span
                  className={
                    'font-mono text-xs tracking-widest ' +
                    (p.active ? 'text-accent' : 'text-ink-faint')
                  }
                >
                  {p.tag.toUpperCase()}
                </span>
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-ink-faint">
                  {p.when}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-dim">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
