import { useEffect, useState } from "react"

import type { PropertyComment } from "../types"

import {
  getAdminPropertyComments,
  getClientPropertyComments,
  setPropertyCommentsVisibility,
} from "../utils/databaseApi"

import { Button, Card } from "./ui"

export default function PropertyComments({
  propertyId,

  mode,

  adminToken,
}: {
  propertyId: string

  mode: "admin" | "client"

  adminToken?: string
}) {
  const [comments, setComments] = useState<PropertyComment[]>([])

  const [isOpen, setIsOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)

  const [isUpdating, setIsUpdating] = useState(false)

  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    setIsLoading(true)

    setError("")

    const request =
      mode === "admin" && adminToken
        ? getAdminPropertyComments(adminToken, propertyId)
        : getClientPropertyComments(propertyId)

    request

      .then((result) => {
        if (!active) return

        setComments(result.comments)

        setIsOpen(result.open)
      })

      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "No se pudieron cargar los comentarios.",
          )
        }
      })

      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [adminToken, mode, propertyId])

  const toggleVisibility = async () => {
    if (!adminToken || isUpdating) return

    setIsUpdating(true)

    setError("")

    try {
      await setPropertyCommentsVisibility(adminToken, propertyId, !isOpen)

      setIsOpen(!isOpen)

      setComments((current) =>
        current.map((comment) => ({
          ...comment,

          visible: !isOpen,
        })),
      )
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo cambiar la visibilidad de los comentarios.",
      )
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold">Comentarios</h4>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Comentarios de ejemplo, no son opiniones de clientes reales.
          </p>
        </div>
        {mode === "admin" && (
          <Button
            variant={isOpen ? "danger" : "secondary"}
            onClick={() => void toggleVisibility()}
            disabled={isLoading || isUpdating || comments.length === 0}
          >
            {isUpdating
              ? "Guardando…"
              : isOpen
                ? "Cerrar para clientes"
                : "Abrir para clientes"}
          </Button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          Cargando comentarios…
        </p>
      ) : mode === "client" && !isOpen ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          Los comentarios están cerrados para esta propiedad.
        </p>
      ) : comments.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          Esta propiedad todavía no tiene comentarios.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl bg-[var(--surface-soft)] p-3"
            >
              <p className="text-sm leading-6">{comment.text}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {comment.author}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
