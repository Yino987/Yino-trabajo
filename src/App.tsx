import { useEffect, useState } from "react"

import LoginPage from "./pages/LoginPage"

import AdminApp from "./roles/admin/AdminApp"

import AgentApp from "./roles/agent/AgentApp"

import ClientApp from "./roles/client/ClientApp"

import type { Role, Theme, User } from "./types"

function isLoginResponse(
  value: unknown,
): value is { token: string; user: User } {
  if (typeof value !== "object" || value === null || !("user" in value)) {
    return false
  }

  const user = value.user
  return (
    "token" in value &&
    typeof value.token === "string" &&
    typeof user === "object" &&
    user !== null &&
    "id" in user &&
    typeof user.id === "string" &&
    "name" in user &&
    typeof user.name === "string" &&
    "email" in user &&
    typeof user.email === "string" &&
    "role" in user &&
    ["admin", "agent", "client"].includes(String(user.role))
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)

  const [adminToken, setAdminToken] = useState<string | null>(null)

  const [accountToken, setAccountToken] = useState<string | null>(null)

  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("huancayork-theme")

    if (stored === "light" || stored === "dark") return stored

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    localStorage.setItem("huancayork-theme", theme)
  }, [theme])

  const toggleTheme = () =>
    setTheme((current) => (current === "light" ? "dark" : "light"))
  const handleLogin = async (role: Role, email: string, password: string) => {
    if (role === "admin") {
      let response: Response

      try {
        response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
      } catch {
        throw new Error(
          "La API local no está encendida. En otra terminal ejecuta: npm run api:dev",
        )
      }

      const result: unknown = await response.json().catch(() => null)

      if (!response.ok || !isLoginResponse(result) || result.user.role !== "admin") {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : `No se pudo iniciar sesión (HTTP ${response.status}).`

        throw new Error(message)
      }

      setAdminToken(result.token)
      setUser(result.user)
      return
    }

    let response: Response
    try {
      response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role === "client" ? "cliente" : "agente",
          email,
          password,
        }),
      })
    } catch {
      throw new Error(
        "La API local no está encendida. En otra terminal ejecuta: npm run api:dev",
      )
    }

    const result: unknown = await response.json().catch(() => null)
    if (!response.ok || !isLoginResponse(result) || result.user.role === "admin") {
      const message =
        typeof result === "object" &&
        result !== null &&
        "error" in result &&
        typeof result.error === "string"
          ? result.error
          : `No se pudo iniciar sesión (HTTP ${response.status}).`
      throw new Error(message)
    }
    setAccountToken(result.token)
    setUser(result.user)
  }

  const logout = () => {
    if (accountToken) {
      void fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${accountToken}` },
      }).catch((error: unknown) => {
        console.error("No se pudo cerrar la sesión de usuario.", error)
      })
    }

    if (adminToken) {
      void fetch("/api/admin/logout", {
        method: "POST",

        headers: { Authorization: `Bearer ${adminToken}` },
      }).catch((error: unknown) => {
        console.error("No se pudo cerrar la sesión de administrador.", error)
      })
    }

    setAdminToken(null)
    setAccountToken(null)

    setUser(null)
  }

  if (!user) {
    return (
      <LoginPage
        theme={theme}
        onThemeToggle={toggleTheme}
        onLogin={handleLogin}
      />
    )
  }

  const common = { user, theme, onThemeToggle: toggleTheme, onLogout: logout }

  if (user.role === "admin") {
    return <AdminApp {...common} adminToken={adminToken ?? ""} />
  }

  if (user.role === "agent")
    return <AgentApp {...common} accountToken={accountToken ?? ""} />

  return <ClientApp {...common} accountToken={accountToken ?? ""} />
}
