import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? 'asset-management',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'asset-ui',
})

type AuthContextValue = {
  authenticated: boolean
  loading: boolean
  username?: string
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
let initialized = false

export async function getAccessToken(): Promise<string | undefined> {
  if (!keycloak.authenticated) return undefined
  await keycloak.updateToken(30)
  return keycloak.token
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [, refresh] = useState(0)

  useEffect(() => {
    if (initialized) return
    initialized = true
    keycloak
      .init({ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false })
      .then((isAuthenticated: boolean) => setAuthenticated(isAuthenticated))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!authenticated) return
    const timer = window.setInterval(() => {
      keycloak.updateToken(30).then(() => refresh((value) => value + 1)).catch(() => keycloak.logout())
    }, 20_000)
    return () => window.clearInterval(timer)
  }, [authenticated])

  const value = useMemo<AuthContextValue>(() => ({
    authenticated,
    loading,
    username: keycloak.tokenParsed?.preferred_username,
    login: () => keycloak.login(),
    logout: () => keycloak.logout({ redirectUri: window.location.origin }),
  }), [authenticated, loading])

  if (loading) return <p>Signing you in...</p>
  if (!authenticated) return <button type="button" onClick={() => void value.login()}>Sign in</button>
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
