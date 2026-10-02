import { useEffect, useState } from "react"
import LoginPage from "./pages/LoginPage"
import AdminApp from "./roles/admin/AdminApp"
import AgentApp from "./roles/agent/AgentApp"
import ClientApp from "./roles/client/ClientApp"
import type { Role, Theme, User } from "./types"

const USERS: Record<Role, User> = {
  admin: {
    id: "u-admin",
    name: "Seymon Pascual",
    email: "admin@huancayork.pe",
    role: "admin",
  },
  agent: {
    id: "a-01",
    name: "Valeria Rojas",
    email: "valeria@huancayork.pe",
    role: "agent",
  },
  client: {
    id: "c-01",
    name: "Diego Salazar",
    email: "diego@gmail.com",
    role: "client",
  },
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
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
  const logout = () => setUser(null)

  if (!user) {
    return (
      <LoginPage
        theme={theme}
        onThemeToggle={toggleTheme}
        onLogin={(role) => setUser(USERS[role])}
      />
    )
  }

  const common = { user, theme, onThemeToggle: toggleTheme, onLogout: logout }
  if (user.role === "admin") return <AdminApp {...common} />
  if (user.role === "agent") return <AgentApp {...common} />
  return <ClientApp {...common} />
}
