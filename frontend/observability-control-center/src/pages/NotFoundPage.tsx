import { Link } from 'react-router-dom'
import { PlaceholderPage } from './PlaceholderPage'

export const NotFoundPage = () => (
  <PlaceholderPage
    title="Page Not Found"
    description="The route does not exist in the current module map."
  >
    <Link className="nav-link active" to="/dashboard">
      Return to Dashboard
    </Link>
  </PlaceholderPage>
)
