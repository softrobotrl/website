export function TendonMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M11 6 L11 15 L21 20 L21 27"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="6" r="2.1" fill="currentColor" />
      <circle cx="11" cy="15" r="2.1" fill="currentColor" />
      <circle cx="21" cy="20" r="2.1" fill="currentColor" />
      <circle cx="21" cy="27" r="2.1" fill="currentColor" />
    </svg>
  )
}
