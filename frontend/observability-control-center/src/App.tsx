import { AppRouter } from './app/AppRouter'
import { AppStateProvider } from './store/AppStateContext'

function App() {
  return (
    <AppStateProvider>
      <AppRouter />
    </AppStateProvider>
  )
}

export default App
