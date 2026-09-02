import { useState } from 'react'
import { KinesisLogo } from './KinesisLogo'
import { MaskedHeading } from './MaskedHeading'

const contactHref =
  'mailto:j73liao@uwaterloo.ca,hisadiq@uwaterloo.ca?subject=Gradus%20RL%20sponsorship%20and%20collaboration'

const sponsors = [
  {
    name: 'Kinesis',
    href: 'https://kinesis.network/',
    logo: KinesisLogo,
  },
]

const collaborationAreas = [
  {
    title: 'Hardware & fabrication',
    detail:
      'Financial support helps us build, test, and refine the physical robot. Sponsorship would cover the hardware, fabrication, sensing, electronics, materials, replacement parts, and test equipment needed to move from simulation to reliable real-world experiments and repeat designs as we learn.',
  },
  {
    title: 'Compute & infrastructure',
    detail:
      'Financial support or compute credits help us train and evaluate reinforcement-learning policies at a useful scale. Access to dependable computing capacity, experiment storage, and supporting infrastructure would let us run more simulations, compare approaches carefully, reproduce results, and reduce delays caused by limited shared resources.',
  },
  {
    title: 'Research & technical review',
    detail:
      'We would appreciate research and technical review from partners with experience in reinforcement learning, robotics, controls, or related areas. Periodic feedback on our approach, experiments, simulation, software, evaluation, and technical writing would help us identify weak assumptions early and improve the rigor and usefulness of the work.',
  },
]

export function Collaborate() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section id="sponsors" className="collaborate-section section-panel--light border-b py-28 sm:py-36">
      <div className="section-shell collaborate-layout">
        <div className="collaborate-heading">
          <MaskedHeading lines={['Sponsor.', 'Collaborate.']} className="section-title text-ink" />
          <a href={contactHref} className="collaborate-link">
            Contact us
          </a>
        </div>

        <div className="collaborate-main">
          <ul className="collaborate-areas">
            {collaborationAreas.map(({ title, detail }, index) => {
              const isActive = activeIndex === index
              const triggerId = `collaborate-trigger-${index}`
              const contentId = `collaborate-content-${index}`

              return (
                <li key={title} data-active={isActive}>
                  <button
                    id={triggerId}
                    type="button"
                    className="collaborate-area__trigger"
                    aria-expanded={isActive}
                    aria-controls={contentId}
                    onClick={() => setActiveIndex(index)}
                  >
                    <span className="collaborate-area__title">{title}</span>
                    <span className="collaborate-area__icon" aria-hidden="true" />
                  </button>
                  <div
                    id={contentId}
                    className="collaborate-area__content"
                    role="region"
                    aria-labelledby={triggerId}
                    aria-hidden={!isActive}
                  >
                    <div className="collaborate-area__content-inner">
                      <div className="collaborate-area__content-copy">
                        <p>{detail}</p>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="sponsor-roster">
          <div className="sponsor-roster__intro">
            <p className="sponsor-roster__label">Our sponsors</p>
            <p className="sponsor-roster__note">
              Supporting the hardware, compute, and research that move this project from simulation to a physical robot.
            </p>
          </div>

          <ul className="sponsor-roster__list">
            {sponsors.map(({ name, href, logo: Logo }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-card"
                  aria-label={`${name} — visit website`}
                >
                  <Logo className="sponsor-card__logo" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
