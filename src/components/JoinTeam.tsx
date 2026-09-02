import { AsciiHands } from './AsciiHands'
import { MaskedHeading } from './MaskedHeading'
import { ScrambleText } from './ScrambleText'

const communityLinks = [
  { label: 'WAT.ai Discord', href: 'https://discord.gg/5eHwMxCgy' },
  { label: 'WAT.ai Instagram', href: 'https://www.instagram.com/wataiteam/' },
]

export function JoinTeam() {
  return (
    <div id="contact" className="join-team">
      <div className="join-team__content">
        <div className="join-team__copy">
          <MaskedHeading lines={['Build with us']} className="section-title !max-w-[12ch]" />
          <p>
            Interested in joining Gradus RL? Applications open soon through WAT.ai. Join the Discord or follow along on
            Instagram to hear when recruitment starts, or contact the technical project managers above to learn about
            opportunities on the team.
          </p>

          <div className="join-team__links">
            {communityLinks.map(({ label, href }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="join-team__link">
                <ScrambleText trigger="hover" hoverTarget="parent">
                  {label}
                </ScrambleText>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="join-team__visual">
        <AsciiHands />
      </div>
    </div>
  )
}
