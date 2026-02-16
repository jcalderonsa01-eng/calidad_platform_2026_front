import { AppRouter } from "./router/AppRouter"
import { AuthProvider } from "./context/authContext"

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
