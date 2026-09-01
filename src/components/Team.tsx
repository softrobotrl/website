import { BrandOrbIcon } from './BrandOrbIcon'
import { JoinTeam } from './JoinTeam'
import { MaskedHeading } from './MaskedHeading'

type TeamMember = {
  name: string
  program: string
  role: string
  focus: string
  linkedin: string
  x?: string
  email: string
}

type SocialLink = {
  label: string
  href: string
  variant: 'linkedin' | 'x' | 'email'
  external: boolean
}

const team: TeamMember[] = [
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
    focus: 'Mechanical & electrical design, fabrication, firmware, marketing, and sponsorships',
    linkedin: 'https://www.linkedin.com/in/haaris-sadiq/',
    x: 'https://x.com/byHaarisSadiq',
    email: 's.haaris.2020@gmail.com',
  },
]

const socialLinks = (member: TeamMember) => {
  const links: SocialLink[] = [
    {
      label: `${member.name} on LinkedIn`,
      href: member.linkedin,
      variant: 'linkedin' as const,
      external: true,
    },
    {
      label: `Email ${member.name}`,
      href: `mailto:${member.email}`,
      variant: 'email' as const,
      external: false,
    },
  ]

  if (member.x) {
    links.splice(1, 0, {
      label: `${member.name} on X`,
      href: member.x,
      variant: 'x' as const,
      external: true,
    })
  }

  return links
}

export function Team() {
  return (
    <section id="team" className="section-panel--dark border-b border-border-soft bg-bg py-28 sm:py-36">
      <div className="section-shell">
        <MaskedHeading lines={['The Team']} className="team-heading section-title text-ink" />

        <div className="team-grid">
          {team.map((m) => (
            <article key={m.name} className="team-member">
              <h3>{m.name}</h3>
              <p className="team-member__program">{m.program}</p>
              <p className="team-member__role">{m.role}</p>
              <p className="team-member__focus">{m.focus}</p>

              <div className="team-member__socials" aria-label={`${m.name}'s contact links`}>
                {socialLinks(m).map((social) => (
                  <a
                    key={social.variant}
                    href={social.href}
                    target={social.external ? '_blank' : undefined}
                    rel={social.external ? 'noopener noreferrer' : undefined}
                    className={`team-social-link team-social-link--${social.variant}`}
                    aria-label={social.label}
                    title={social.label}
                  >
                    <BrandOrbIcon variant={social.variant} tone="dark" />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>

        <JoinTeam />
      </div>
    </section>
  )
}
