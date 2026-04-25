import { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { Footer } from "./Footer"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content-shell">
        <Topbar />
        <div className="page-wrap">{children}</div>
        <Footer />
      </div>
    </div>
  )
}
