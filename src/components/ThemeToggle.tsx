import type { Theme } from "../types"
import Icon from "./Icon"

export default function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: Theme
  onToggle: () => void
}) {
  const next = theme === "light" ? "oscuro" : "claro"
  return (
    <button
      onClick={onToggle}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--muted)] transition hover:text-[var(--text)]"
      aria-label={`Activar modo ${next}`}
      title={`Activar modo ${next}`}
    >
      <Icon name={theme === "light" ? "moon" : "sun"} size={19} />
    </button>
  )
}
