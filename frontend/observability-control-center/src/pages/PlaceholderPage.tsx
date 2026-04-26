import type { PropsWithChildren } from 'react'
import { AppFrame } from '../components/layout/AppFrame'

interface PlaceholderPageProps extends PropsWithChildren {
  title: string
  description: string
}

export const PlaceholderPage = ({ title, description, children }: PlaceholderPageProps) => (
  <AppFrame>
    <section className="panel placeholder-page">
      <h2>{title}</h2>
      <p>{description}</p>
      <p>
        This route is intentionally mocked to preserve extension points for module integration,
        API wiring, validation, and authorization policies.
      </p>
      {children}
    </section>
  </AppFrame>
)
