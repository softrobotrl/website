import { TendonMark } from './TendonMark'

export function Footer() {
  return (
    <footer className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 text-ink-faint">
          <TendonMark className="h-4 w-4" />
          <span className="font-mono text-xs">GradusRL — a WAT.ai research team</span>
        </div>
        <a
          href="https://github.com/softrobotrl"
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-ink-faint transition hover:text-accent"
        >
          github.com/softrobotrl
        </a>
      </div>
    </footer>
  )
}
