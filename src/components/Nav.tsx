import { TendonMark } from './TendonMark'

const links = [
  { href: '#research', label: 'Research' },
  { href: '#approach', label: 'Approach' },
  { href: '#roadmap', label: 'Roadmap' },
  { href: '#team', label: 'Team' },
  { href: '#get-involved', label: 'Get Involved' },
]

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-soft bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5 text-ink">
          <TendonMark className="h-5 w-5 text-accent" />
          <span className="font-mono text-sm font-medium tracking-tight">
            GradusRL
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-sm text-ink-dim sm:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="https://github.com/softrobotrl"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-border px-3.5 py-1.5 text-sm text-ink-dim transition hover:border-accent/50 hover:text-ink"
        >
          GitHub
        </a>
      </div>
    </header>
  )
}
