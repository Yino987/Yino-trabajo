import { useState, type FormEvent } from "react"

import type { Role, Theme } from "../types"

import Icon from "../components/Icon"

import ThemeToggle from "../components/ThemeToggle"

import { Button, Input } from "../components/ui"

const roles: Array<{
  id: Role
  title: string
  detail: string
  icon: string
}> = [
  {
    id: "admin",

    title: "Administrador",

    detail: "Control total, equipo y reportes",

    icon: "settings",
  },

  {
    id: "agent",

    title: "Agente",

    detail: "Cartera, visitas y ventas",

    icon: "badge",
  },

  {
    id: "client",

    title: "Cliente",

    detail: "Propiedades y solicitudes",

    icon: "home",
  },
]

export default function LoginPage({
  theme,

  onThemeToggle,

  onLogin,
}: {
  theme: Theme

  onThemeToggle: () => void

  onLogin: (role: Role, email: string, password: string) => Promise<void>
}) {
  const [role, setRole] = useState<Role>("client")

  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")

  const [error, setError] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    setError("")

    setIsSubmitting(true)

    try {
      await onLogin(role, email, password)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] p-4 sm:p-6">
      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[720px] overflow-hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=90"
            alt="Casa moderna representada por Huancayork"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102d22] via-[#173d2d]/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur">
              Valle del Mantaro · Perú
            </div>
            <h1 className="font-display max-w-xl text-5xl font-bold leading-[1.08]">
              Un hogar se encuentra mejor con información clara.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
              Gestiona propiedades, visitas y contratos desde un espacio
              diseñado para cada persona.
            </p>
          </div>
        </section>
        <section className="flex items-center justify-center px-6 py-14 sm:px-12">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3">
              <img
                src="/inmobiliaria.png"
                alt="Habitat Inmobiliaria"
                className="h-14 w-14 rounded-2xl bg-white object-contain"
              />
              <div>
                <p className="font-display text-2xl font-bold">Huancayork</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                  Sistema inmobiliario
                </p>
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
              Bienvenido
            </p>
            <h2 className="font-display mt-2 text-4xl font-bold">
              Ingresa a tu espacio
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Accede con la cuenta vinculada a Inmobiliaria. El administrador
              habilita los accesos de clientes y agentes desde sus fichas.
            </p>

            <div className="mt-7 grid grid-cols-3 gap-2">
              {roles.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setRole(item.id)
                    setError("")
                    setPassword("")
                  }}
                  className={`rounded-2xl border p-3 text-left transition ${
                    role === item.id
                      ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                      : "border-[var(--border)] hover:bg-[var(--surface-soft)]"
                  }`}
                >
                  <Icon
                    name={item.icon}
                    size={20}
                    className={
                      role === item.id
                        ? "text-[var(--brand)]"
                        : "text-[var(--muted)]"
                    }
                  />
                  <p className="mt-3 text-sm font-bold">{item.title}</p>
                  <p className="mt-1 hidden text-[10px] leading-4 text-[var(--muted)] sm:block">
                    {item.detail}
                  </p>
                </button>
              ))}
            </div>

            <form className="mt-7 space-y-4" onSubmit={submit}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Correo electrónico
                </span>
                <Input
                  type="email"
                  placeholder={
                    role === "admin"
                      ? "Yino@gmail.com"
                      : "nombre@correo.com"
                  }
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Contraseña
                </span>
                <Input
                  type="password"
                  placeholder={
                    role === "admin"
                      ? "Contraseña de administrador"
                      : "Contraseña"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
                >
                  {error}
                </p>
              )}
              <p className="text-xs leading-5 text-[var(--muted)]">
                Si todavía no tienes una cuenta de cliente o agente, solicita
                al administrador que la habilite desde tu ficha.
              </p>
              <Button
                type="submit"
                className="w-full py-3.5"
                disabled={isSubmitting}
              >
                Ingresar como {roles.find((item) => item.id === role)?.title}
                <Icon name="arrow" size={17} />
              </Button>
            </form>
            <p className="mt-8 text-center text-xs text-[var(--muted)]">
              HUANCAYORK SAC · Modo local
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
