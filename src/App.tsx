import { Abstract } from './components/Abstract'
import { Blog } from './components/Blog'
import { Collaborate } from './components/Collaborate'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { NotFound } from './components/NotFound'
import { Roadmap } from './components/Roadmap'
import { SiteLoader } from './components/SiteLoader'
import { Team } from './components/Team'
import { TendonField } from './components/TendonField'
import { isHomePath } from './sitePath'

function App() {
  if (!isHomePath(window.location.pathname)) {
    return <NotFound />
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteLoader />
      <Nav />
      <main id="main-content" tabIndex={-1} className="relative overflow-x-clip">
        <Hero />
        <TendonField>
          <Abstract />
          <Roadmap />
        </TendonField>
        <Blog />
        <Team />
        <Collaborate />
      </main>
      <Footer />
    </div>
  )
}

export default App
