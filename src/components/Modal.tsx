import type { ReactNode } from "react"

import { createPortal } from "react-dom"

import Icon from "./Icon"

export default function Modal({
  title,

  onClose,

  children,

  anchor,
  size = "default",
}: {
  title: string

  onClose: () => void

  children: ReactNode

  anchor?: {
    left: number
    top: number
  } | null
  size?: "default" | "wide"
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
      onClick={anchor ? onClose : undefined}
    >
      <div
        className={`${
          anchor ? "" : "fade-in"
        } max-h-[90vh] w-full ${
          size === "wide" ? "max-w-4xl" : "max-w-lg"
        } overflow-auto rounded-3xl border border-[var(--border)] bg-[var(--surface-raised)] p-6 shadow-2xl`}
        style={
          anchor
            ? {
                position: "fixed",

                left: anchor.left,

                top: anchor.top,

                transform: "translate(-50%, -50%)",
              }
            : undefined
        }
        onClick={(event) => event.stopPropagation()}
      >
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
    </div>,

    document.body,
  )
}
