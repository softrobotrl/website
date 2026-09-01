import { BlogImageReveal } from './BlogImageReveal'
import { MaskedHeading } from './MaskedHeading'

export function Blog() {
  return (
    <section id="blog" className="blog-section section-panel--light border-b py-16 sm:py-20">
      <div className="section-shell">
        <div className="blog-intro">
          <MaskedHeading lines={['Blog']} className="section-title text-ink" />
          <p>
            As the project progresses, this space will collect blog posts, build photos, and moments from team
            gatherings.
          </p>
        </div>

        <BlogImageReveal />
      </div>
    </section>
  )
}
