import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react"
import Icon from "./Icon"

export function Button({
  children,
  variant = "primary",
  icon,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  icon?: string
}) {
  const variants = {
    primary: "bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]",
    secondary:
      "bg-[var(--surface-raised)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-soft)]",
    ghost:
      "bg-transparent text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]",
    danger: "bg-[var(--danger-soft)] text-[var(--danger)] hover:opacity-80",
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} size={17} />}
      {children}
    </button>
  )
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] ${className}`}
      {...props}
    />
  )
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      {children}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const positive = [
    "Disponible",
    "Activo",
    "Confirmada",
    "Realizada",
    "Completado",
    "Cliente",
  ]
  const warning = ["Reservada", "Programada", "En seguimiento", "Borrador"]
  const danger = ["Cancelada", "Vacaciones"]
  const style = positive.includes(status)
    ? "bg-[var(--brand-soft)] text-[var(--brand)]"
    : warning.includes(status)
      ? "bg-[var(--warning-soft)] text-[var(--warning)]"
      : danger.includes(status)
        ? "bg-[var(--danger-soft)] text-[var(--danger)]"
        : "bg-[var(--info-soft)] text-[var(--info)]"
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${style}`}
    >
      {status}
    </span>
  )
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <Card className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 rounded-full bg-[var(--brand-soft)] p-4 text-[var(--brand)]">
        <Icon name="home" size={26} />
      </div>
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  )
}
