import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from 'react'
import { fetchMetrics } from '../services/metricsService'
import type { AppState, MetricsResponse } from '../types/metrics'
import { AppStateContext } from './appStateContextObject'

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: MetricsResponse }
  | { type: 'FETCH_ERROR'; payload: string }

const POLL_MS = 3000

const initialState: AppState = {
  metrics: null,
  loading: false,
  error: null,
}

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { metrics: action.payload, loading: false, error: null }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

export const AppStateProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const refresh = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_START' })
      const data = await fetchMetrics(state.metrics ?? undefined)
      dispatch({ type: 'FETCH_SUCCESS', payload: data })
    } catch {
      dispatch({
        type: 'FETCH_ERROR',
        payload: 'Unable to load /metrics. Check API connectivity and retry.',
      })
    }
  }, [state.metrics])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => {
      void refresh()
    }, POLL_MS)

    return () => window.clearInterval(timer)
  }, [refresh])

  const value = useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
