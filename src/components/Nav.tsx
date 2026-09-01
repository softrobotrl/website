import { useEffect, useRef, useState } from 'react'
import { TendonMark } from './TendonMark'
import { ScrambleText } from './ScrambleText'
import { createTopDockController } from './topDockController'

const items = [
  {
    id: 'research',
    label: 'Research',
    icon: <path d="M3 13V3h10v10H3Zm2-8h6M5 8h6M5 11h3" />,
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    icon: (
      <>
        <circle cx="3" cy="8" r="1.5" />
        <circle cx="12.5" cy="3.5" r="1.5" />
        <circle cx="12.5" cy="12.5" r="1.5" />
        <path d="M4.5 7.3 11 4.2M4.5 8.7l6.5 3.1" />
      </>
    ),
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: (
      <>
        <path d="M2.5 12.5 6 9l2.3 2.2L13.5 6" />
        <path d="M10 6h3.5v3.5" />
      </>
    ),
  },
  {
    id: 'team',
    label: 'Team',
    icon: (
      <>
        <circle cx="5.2" cy="5" r="2.2" />
        <circle cx="11.5" cy="5.8" r="1.8" />
        <path d="M1.8 13c.4-2.4 1.7-3.7 3.8-3.7 2.2 0 3.5 1.3 3.8 3.7M9.3 10c1.1-.5 3.6-.4 4.3 2.3" />
      </>
    ),
  },
  {
    id: 'sponsors',
    label: 'Sponsors',
    icon: (
      <>
        <path d="M2.5 8h11M8 2.5v11" />
        <circle cx="8" cy="8" r="5.5" />
      </>
    ),
  },
] as const

const dockOptions = {
  proximity: 122,
  spring: 0.19,
  damping: 0.7,
  widthGrowth: 17,
  heightGrowth: 12,
  drop: 3,
}

export function Nav() {
  const navRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState('top')

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    return createTopDockController(nav, () => dockOptions)
  }, [])

  useEffect(() => {
    const sections = ['top', ...items.map((item) => item.id)]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActive(visible.target.id)
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.25, 0.6] },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <header className="top-dock-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <nav ref={navRef} className="top-dock" aria-label="Primary navigation">
        <a
          href="#top"
          aria-label="Gradus RL home"
          aria-current={active === 'top' ? 'location' : undefined}
          className="top-dock__item top-dock__logo"
          data-dock-item
          onClick={() => setActive('top')}
        >
          <TendonMark className="h-5 w-5" />
        </a>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-label={item.label}
            aria-current={active === item.id ? 'location' : undefined}
            className="top-dock__item top-dock__link"
            data-dock-item
            onClick={() => setActive(item.id)}
          >
            <span className="top-dock__icon" aria-hidden="true">
              <svg viewBox="0 0 16 16">{item.icon}</svg>
            </span>
            <ScrambleText
              trigger="hover"
              hoverTarget="parent"
              duration={0.22}
              noiseColor={active === item.id ? 'var(--color-accent-ink)' : undefined}
            >
              {item.label}
            </ScrambleText>
          </a>
        ))}
      </nav>
    </header>
  )
}
