import { AppShell } from "@/components/layout/AppShell"

export default function EndpointsPage() {
  return (
    <main>
      <AppShell>
        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title">Endpoints Module</h2>
          <p className="h2">Endpoint Risk Table (placeholder)</p>
          <p className="note">
            Planned extension: endpoint-level SLOs, latency/error trends, and route-level cost attribution.
          </p>
        </section>
      </AppShell>
    </main>
  )
}
