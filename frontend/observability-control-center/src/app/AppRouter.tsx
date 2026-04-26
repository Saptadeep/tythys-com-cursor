import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AuthPage } from '../pages/AuthPage'
import { ContactPage } from '../pages/ContactPage'
import { DashboardPage } from '../pages/DashboardPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { UserCreatePage } from '../pages/UserCreatePage'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/users/new', element: <UserCreatePage /> },
  { path: '/auth/login', element: <AuthPage /> },
  { path: '*', element: <NotFoundPage /> },
])

export const AppRouter = () => {
  return <RouterProvider router={router} />
}
