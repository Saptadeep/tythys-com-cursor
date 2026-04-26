import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const ContactPage = lazy(() =>
  import('../pages/ContactPage').then((module) => ({ default: module.ContactPage })),
)
const UserCreatePage = lazy(() =>
  import('../pages/UserCreatePage').then((module) => ({ default: module.UserCreatePage })),
)
const AuthPage = lazy(() =>
  import('../pages/AuthPage').then((module) => ({ default: module.AuthPage })),
)
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
)

export const AppRouter = () => {
  return (
    <Suspense fallback={<div className="route-loading">Loading module...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/users/new" element={<UserCreatePage />} />
        <Route path="/auth/login" element={<AuthPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
