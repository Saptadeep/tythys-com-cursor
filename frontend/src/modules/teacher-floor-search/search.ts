import type { SeatingRow } from './data'
import { SEATING_ROWS } from './data'

export type TeacherSeat = {
  teacher: string
  room: string
  floor: string
}

const PREFIX_LEN = 3
/** More than 4 characters → long-query mode (length ≥ 5). */
const LONG_QUERY_MIN_LEN = 5
const TEACHER_FIRST_MATCH_LEN = 5

function normalizeSpaces(s: string): string {
  return s.trim().replace(/\s+/g, ' ')
}

/** Lowercase name with honorific stripped (same rule as short-prefix search). */
function teacherNormForCompare(teacherOrQuery: string): string {
  const full = normalizeSpaces(teacherOrQuery).toLowerCase()
  return full.replace(/^(?:mr|ms|mrs|dr)\.\s*/, '')
}

function firstFiveComparable(teacherName: string): string {
  return teacherNormForCompare(teacherName).slice(0, TEACHER_FIRST_MATCH_LEN)
}

/**
 * Length > 4: match teachers whose first five comparable letters equal the query’s
 * first five comparable letters. One match → solo; several → narrow by full query prefix.
 * Returns `null` to use the short (3-letter) rules instead.
 */
function resolveLongTeacherQuery(trimmed: string): SearchOutcome | null {
  if (trimmed.length < LONG_QUERY_MIN_LEN) return null

  const qNorm = teacherNormForCompare(trimmed)
  const q5 = qNorm.slice(0, TEACHER_FIRST_MATCH_LEN)
  if (q5.length < TEACHER_FIRST_MATCH_LEN) return null

  const all = dedupeSeats(expandRows(SEATING_ROWS))
  const matches = all.filter((s) => firstFiveComparable(s.teacher) === q5)

  if (matches.length === 0) return null

  if (matches.length === 1) {
    return { kind: 'solo', seat: matches[0]! }
  }

  const narrowed = matches.filter((s) =>
    teacherNormForCompare(s.teacher).startsWith(qNorm),
  )

  if (narrowed.length === 1) return { kind: 'solo', seat: narrowed[0]! }
  return { kind: 'ambiguous' }
}

/** Match first letters against full label or against text after Mr./Ms./Mrs./Dr. */
export function teacherMatchesPrefix(teacherName: string, prefixLower: string): boolean {
  const full = normalizeSpaces(teacherName).toLowerCase()
  if (full.startsWith(prefixLower)) return true
  const stripped = full.replace(/^(?:mr|ms|mrs|dr)\.\s*/, '')
  return stripped.startsWith(prefixLower)
}

function floorMatchesPrefix(floor: string, prefixLower: string): boolean {
  return normalizeSpaces(floor).toLowerCase().startsWith(prefixLower)
}

function expandRows(rows: Iterable<SeatingRow>): TeacherSeat[] {
  const out: TeacherSeat[] = []
  for (const row of rows) {
    for (const teacher of row.teachers) {
      out.push({
        teacher: normalizeSpaces(teacher),
        room: normalizeSpaces(row.room),
        floor: normalizeSpaces(row.floor),
      })
    }
  }
  return out
}

function uniqueFloorsFromTeachersMatchingPrefix(prefixLower: string): Set<string> {
  const floors = new Set<string>()
  for (const row of SEATING_ROWS) {
    for (const t of row.teachers) {
      if (teacherMatchesPrefix(t, prefixLower)) {
        floors.add(normalizeSpaces(row.floor))
      }
    }
  }
  return floors
}

function rowsOnFloors(floors: Set<string>): SeatingRow[] {
  return SEATING_ROWS.filter((row) => floors.has(normalizeSpaces(row.floor)))
}

function rowsMatchingFloorPrefix(prefixLower: string): SeatingRow[] {
  return SEATING_ROWS.filter((row) => floorMatchesPrefix(row.floor, prefixLower))
}

function sortSeats(a: TeacherSeat, b: TeacherSeat): number {
  const f = a.floor.localeCompare(b.floor, undefined, { sensitivity: 'base' })
  if (f !== 0) return f
  const r = a.room.localeCompare(b.room, undefined, { sensitivity: 'base' })
  if (r !== 0) return r
  return a.teacher.localeCompare(b.teacher, undefined, { sensitivity: 'base' })
}

function dedupeSeats(seats: TeacherSeat[]): TeacherSeat[] {
  const seen = new Set<string>()
  const out: TeacherSeat[] = []
  for (const s of seats) {
    const key = `${s.teacher}|${s.room}|${s.floor}`.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
  }
  out.sort(sortSeats)
  return out
}

export type SearchOutcome =
  | { kind: 'need_more' }
  | { kind: 'none' }
  | { kind: 'ambiguous' }
  | { kind: 'solo'; seat: TeacherSeat }
  | { kind: 'by_teacher'; seats: TeacherSeat[] }
  | { kind: 'by_floor'; seats: TeacherSeat[] }

/**
 * Length ≥ 5: first-five comparable letters uniquely identify one teacher → solo result.
 * Otherwise uses the first three letters (teacher name vs floor).
 */
export function searchSeats(query: string): SearchOutcome {
  const trimmed = normalizeSpaces(query)

  const longOutcome = resolveLongTeacherQuery(trimmed)
  if (longOutcome !== null) return longOutcome

  if (trimmed.length < PREFIX_LEN) return { kind: 'need_more' }

  const prefixLower = trimmed.slice(0, PREFIX_LEN).toLowerCase()

  const teacherFloors = uniqueFloorsFromTeachersMatchingPrefix(prefixLower)
  if (teacherFloors.size > 0) {
    const seats = dedupeSeats(expandRows(rowsOnFloors(teacherFloors)))
    return seats.length ? { kind: 'by_teacher', seats } : { kind: 'none' }
  }

  const floorRows = rowsMatchingFloorPrefix(prefixLower)
  if (floorRows.length > 0) {
    const seats = dedupeSeats(expandRows(floorRows))
    return seats.length ? { kind: 'by_floor', seats } : { kind: 'none' }
  }

  return { kind: 'none' }
}

export function formatSeatPlainText(seat: TeacherSeat): string {
  return `${seat.teacher}\nRoom: ${seat.room}\nFloor: ${seat.floor}`
}
