import type { Metadata } from 'next'
import { TeacherFloorSearchApp } from '@/modules/teacher-floor-search/TeacherFloorSearchApp'

export const metadata: Metadata = {
  title: 'Teacher / Room / Floor lookup',
  description:
    'Quick plain-text lookup: search by teacher name or floor (first 3 letters).',
  robots: { index: false, follow: false },
}

export default function TeacherFloorSearchPage() {
  return <TeacherFloorSearchApp />
}
