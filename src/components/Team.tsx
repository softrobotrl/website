const team = [
  {
    name: 'John Liao',
    program: 'Computer Science, 2A Co-op',
    role: 'Technical Project Manager',
    focus: 'RL policy & simulation, paper write-up, external collaboration',
    linkedin: 'https://www.linkedin.com/in/john-liao-1b8452317/',
    email: 'johnliao5@gmail.com',
  },
  {
    name: 'Haaris Sadiq',
    program: 'Mechatronics Engineering, 2A',
    role: 'Technical Project Manager',
    focus: 'Mechanical & electrical design, fabrication, firmware',
    linkedin: 'https://www.linkedin.com/in/haaris-sadiq/',
    email: 's.haaris.2020@gmail.com',
  },
]

export function Team() {
  return (
    <section id="team" className="border-b border-border-soft">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <p className="font-mono text-xs tracking-widest text-accent">TEAM</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Technical project managers
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {team.map((m) => (
            <div key={m.name} className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-medium text-ink">{m.name}</h3>
                  <p className="mt-0.5 text-sm text-ink-faint">{m.program}</p>
                </div>
                <span className="shrink-0 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-xs text-accent">
                  TPM
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-ink-dim">{m.focus}</p>

              <div className="mt-5 flex flex-wrap gap-4 border-t border-border-soft pt-4 text-sm">
                <a
                  href={m.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-dim transition hover:text-accent"
                >
                  LinkedIn ↗
                </a>
                <a
                  href={`mailto:${m.email}`}
                  className="text-ink-dim transition hover:text-accent"
                >
                  {m.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
