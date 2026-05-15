'use client'

import { useMemo, useState } from 'react'
import {
  formatSeatPlainText,
  searchSeats,
  type TeacherSeat,
} from './search'
import styles from './TeacherFloorSearchApp.module.css'

function outcomeMeta(
  outcome: ReturnType<typeof searchSeats>,
  query: string,
): string {
  const q = query.trim()
  if (outcome.kind === 'need_more') {
    return 'Type at least 3 letters (case-insensitive).'
  }
  if (outcome.kind === 'ambiguous') {
    return 'Several teachers share those opening letters — keep typing to narrow to one name.'
  }
  if (outcome.kind === 'solo') {
    return 'Matched one teacher (5+ characters typed; first five letters of the name align).'
  }
  if (outcome.kind === 'none') {
    return `No floor or teacher match for “${q.slice(0, 3)}…”.`
  }
  if (outcome.kind === 'by_teacher') {
    return `Matched a teacher prefix — showing everyone on the same floor(s) (${outcome.seats.length} teacher${outcome.seats.length === 1 ? '' : 's'}).`
  }
  return `Matched a floor prefix — showing everyone on that floor (${outcome.seats.length} teacher${outcome.seats.length === 1 ? '' : 's'}).`
}

function seatsToPlainBlock(seats: TeacherSeat[]): string {
  return seats.map(formatSeatPlainText).join('\n—\n')
}

export function TeacherFloorSearchApp() {
  const [query, setQuery] = useState('')
  const outcome = useMemo(() => searchSeats(query), [query])
  const meta = useMemo(() => outcomeMeta(outcome, query), [outcome, query])
  const body = useMemo(() => {
    if (outcome.kind === 'solo') return formatSeatPlainText(outcome.seat)
    if (outcome.kind === 'by_teacher' || outcome.kind === 'by_floor') {
      return seatsToPlainBlock(outcome.seats)
    }
    return ''
  }, [outcome])

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Teacher · Room · Floor</h1>
      <p className={styles.hint}>
        3–4 characters: first 3 letters of a teacher or floor (e.g.{' '}
        <strong>gro</strong> → Ground, <strong>rit</strong> → Ritu&apos;s floor).
        With <strong>5+</strong> characters, only one teacher is shown when the first five letters
        of their name match what you typed (after titles like Ms./Mr.).
      </p>

      <label className={styles.label} htmlFor="teacher-floor-q">
        Search
      </label>
      <input
        id="teacher-floor-q"
        className={styles.input}
        type="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        placeholder="3+ letters, or 5+ for one teacher…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className={styles.results} aria-live="polite">
        <p className={styles.meta}>{meta}</p>
        <pre className={styles.block}>{body || '\u00a0'}</pre>
      </div>
    </div>
  )
}
