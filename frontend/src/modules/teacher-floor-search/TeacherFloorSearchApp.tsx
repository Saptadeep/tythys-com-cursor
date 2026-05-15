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
  if (outcome.kind === 'none') {
    return `No floor or teacher match for “${q.slice(0, 3)}…”.`
  }
  if (outcome.kind === 'by_teacher') {
    return `Matched a teacher prefix — showing everyone on the same floor(s) (${outcome.seats.length} teacher${outcome.seats.length === 1 ? '' : 's'}).`
  }
  return `Matched a floor prefix — showing everyone on that floor (${outcome.seats.length} teacher${outcome.seats.length === 1 ? '' : 's'}).`
}

function seatsToPlainBlock(seats: TeacherSeat[]): string {
  return seats.map(formatSeatPlainText).join('\n\n—\n\n')
}

export function TeacherFloorSearchApp() {
  const [query, setQuery] = useState('')
  const outcome = useMemo(() => searchSeats(query), [query])
  const meta = useMemo(() => outcomeMeta(outcome, query), [outcome, query])
  const body = useMemo(() => {
    if (outcome.kind !== 'by_teacher' && outcome.kind !== 'by_floor') {
      return ''
    }
    return seatsToPlainBlock(outcome.seats)
  }, [outcome])

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Teacher · Room · Floor</h1>
      <p className={styles.hint}>
        Enter the first 3 letters of a teacher&apos;s name or a floor (e.g.{' '}
        <strong>gro</strong> → Ground, <strong>rit</strong> → Ritu&apos;s floor).
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
        placeholder="At least 3 letters…"
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
