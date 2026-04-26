import { useContext } from 'react'
import { AppStateContext } from '../store/appStateContextObject'

export const useAppState = () => {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}
