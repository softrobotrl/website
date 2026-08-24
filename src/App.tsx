import { Abstract } from './components/Abstract'
import { Footer } from './components/Footer'
import { GetInvolved } from './components/GetInvolved'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Roadmap } from './components/Roadmap'
import { Team } from './components/Team'

function App() {
  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <main>
        <Hero />
        <Abstract />
        <Roadmap />
        <Team />
        <GetInvolved />
      </main>
      <Footer />
    </div>
  )
}

export default App
