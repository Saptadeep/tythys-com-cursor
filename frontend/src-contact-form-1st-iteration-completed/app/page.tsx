// src/app/page.tsx
// ─────────────────────────────────────────────────────────────
//  Home page — assembles all sections.
//  Each section is its own component; data flows from config.
// ─────────────────────────────────────────────────────────────
import { TopBar }       from '@/components/layout/Topbar'
import { Navbar }       from '@/components/layout/Navbar'
import { Footer }       from '@/components/layout/Footer'
import { Hero }         from '@/components/sections/Hero'
import { Products }     from '@/components/sections/Products'
import { Process }      from '@/components/sections/Process'
import { About }        from '@/components/sections/About'
import { Contact }      from '@/components/sections/Contact'
import { ParticleCanvas } from '@/components/ui/ParticleCanvas'
import { HUD }          from '@/components/hud/HUD'

export default function HomePage() {
  return (
    <>
      {/* Fixed background particle network */}
      <ParticleCanvas />

      {/* Animated heartbeat top bar */}
      <TopBar />

      {/* Fixed glassmorphic navigation */}
      <Navbar />

      {/* Floating HUD with heartbeat monitor */}
      <HUD />

      {/* Page content */}
      <main className="relative z-10">
        <Hero />
        <Products />
        <Process />
        <About />
        <Contact />
      </main>

      <Footer />
    </>
  )
}
