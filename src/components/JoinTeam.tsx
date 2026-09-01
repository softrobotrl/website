import { AsciiHands } from './AsciiHands'
import { MaskedHeading } from './MaskedHeading'

export function JoinTeam() {
  return (
    <div id="contact" className="join-team">
      <div className="join-team__content">
        <div className="join-team__copy">
          <MaskedHeading lines={['Build with us']} className="section-title !max-w-[12ch]" />
          <p>
            Interested in joining Gradus RL? Contact the technical project managers above to learn about upcoming
            recruitment and opportunities on the team.
          </p>
        </div>
      </div>

      <div className="join-team__visual">
        <AsciiHands />
      </div>
    </div>
  )
}
