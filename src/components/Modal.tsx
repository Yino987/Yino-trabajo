import type { ReactNode } from "react"
import Icon from "./Icon"

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="fade-in max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl border border-[var(--border)] bg-[var(--surface-raised)] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--muted)] hover:bg-[var(--surface-soft)]"
            aria-label="Cerrar"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
