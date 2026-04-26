import { createContext } from 'react'
import type { AppState } from '../types/metrics'

export type AppStateContextValue = AppState & { refresh: () => Promise<void> }

export const AppStateContext = createContext<AppStateContextValue | null>(null)
