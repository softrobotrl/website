import { AsciiHands } from './AsciiHands'
import { MaskedHeading } from './MaskedHeading'
import { ScrambleText } from './ScrambleText'

export function JoinTeam() {
  return (
    <div id="contact" className="join-team">
      <div className="join-team__content">
        <div className="join-team__copy">
          <MaskedHeading lines={['Build with us']} className="section-title !max-w-[12ch]" />
          <p>
            <strong>Applications are open.</strong> We’re hiring core members for mechanical, software, and hardware.
            Come learn with us, have fun, and build cool stuff.
          </p>
          <p>
            Fill out the WAT.ai application form and select <strong>Gradus as your top choice.</strong>
          </p>
          <a
            href="https://forms.gle/PT3KiPXs2LPorG5N6"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-[background-color] duration-150 hover:bg-accent-light"
          >
            <ScrambleText trigger="hover" hoverTarget="parent" noiseColor="var(--color-accent-ink)">
              Apply to Gradus
            </ScrambleText>
          </a>
        </div>
      </div>

      <div className="join-team__visual">
        <AsciiHands />
      </div>
    </div>
  )
}
