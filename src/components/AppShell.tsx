import { useState, type ReactNode } from "react"
import type { NavItem, ShellProps } from "../types"
import Icon from "./Icon"
import ThemeToggle from "./ThemeToggle"

interface AppShellProps extends ShellProps {
  nav: NavItem[]
  active: string
  onNavigate: (id: string) => void
  children: ReactNode
}

const roleLabel = {
  admin: "Administrador",
  agent: "Agente inmobiliario",
  client: "Cliente",
}

export default function AppShell({
  user,
  theme,
  onThemeToggle,
  onLogout,
  nav,
  active,
  onNavigate,
  children,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = (id: string) => {
    onNavigate(id)
    setMenuOpen(false)
  }
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="fixed inset-x-0 top-0 z-40 flex h-18 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:px-7">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-[var(--muted)] lg:hidden"
            aria-label="Abrir menú"
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
          <img
            src="/inmobiliaria.png"
            alt="Habitat Inmobiliaria"
            className="h-10 w-10 rounded-xl bg-white object-contain"
          />
          <div>
            <p className="font-display text-lg font-bold leading-none">
              Huancayork
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              Gestión inmobiliaria
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          <div className="hidden border-l border-[var(--border)] pl-4 sm:block">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-[var(--muted)]">
              {roleLabel[user.role]}
            </p>
          </div>
          <div className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
            {user.name
              .split(" ")
              .map((word) => word[0])
              .slice(0, 2)
              .join("")}
          </div>
        </div>
      </header>

      <aside
        className={`fixed bottom-0 left-0 top-18 z-30 w-64 border-r border-[var(--border)] bg-[var(--surface)] p-4 transition-transform lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex h-full flex-col">
          <div className="flex-1 space-y-1">
            <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
              Espacio de trabajo
            </p>
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                  active === item.id
                    ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                }`}
              >
                <Icon name={item.icon} size={19} />
                {item.label}
              </button>
            ))}
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <div className="mb-3 rounded-xl bg-[var(--surface-soft)] p-3">
              <p className="truncate text-xs font-semibold">{user.email}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {user.role === "admin"
                  ? "Sesión local de administrador"
                  : "Perfil de demostración"}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
            >
              <Icon name="logout" size={18} />
              Cerrar sesión
            </button>
          </div>
        </nav>
      </aside>

      {menuOpen && (
        <button
          className="fixed inset-0 top-18 z-20 bg-black/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
        />
      )}
      <main className="app-scrollbar min-h-screen pt-18 lg:pl-64">
        <div className="fade-in mx-auto max-w-[1500px] p-5 sm:p-7 lg:p-9">
          {children}
        </div>
      </main>
    </div>
  )
}
