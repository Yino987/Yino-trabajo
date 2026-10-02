import { useState } from "react"
import type { Property } from "../types"
import { money } from "../utils/format"
import Icon from "./Icon"
import { Button, StatusBadge } from "./ui"

export default function PropertyCard({
  property,
  mode,
  requested,
  onRequest,
  onContact,
}: {
  property: Property
  mode: "admin" | "agent" | "client"
  requested?: boolean
  onRequest?: (property: Property) => void
  onContact?: (property: Property) => void
}) {
  const [favorite, setFavorite] = useState(false)
  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-1 hover:shadow-[var(--shadow)]">
      <div className="relative h-52 overflow-hidden bg-[var(--surface-soft)]">
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={property.status} />
        </div>
        {mode === "client" && (
          <button
            onClick={() => setFavorite(!favorite)}
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface)]/90 ${
              favorite ? "text-[var(--danger)]" : "text-[var(--muted)]"
            }`}
            aria-label="Guardar propiedad"
          >
            <Icon name="heart" size={18} />
          </button>
        )}
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            {property.operation} · {property.code}
          </span>
          <span className="text-xs text-[var(--muted)]">
            {property.area} m²
          </span>
        </div>
        <h2 className="font-display text-xl font-bold leading-tight">
          {property.title}
        </h2>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--muted)]">
          <Icon name="map" size={15} />
          {property.district}
        </p>
        <div className="my-4 flex gap-4 border-y border-[var(--border)] py-3 text-xs text-[var(--muted)]">
          {property.bedrooms > 0 && (
            <span>{property.bedrooms} dormitorios</span>
          )}
          {property.bathrooms > 0 && <span>{property.bathrooms} baños</span>}
          {property.bedrooms === 0 && <span>Terreno urbano</span>}
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-2xl font-bold text-[var(--brand)]">
              {money(property.price)}
            </p>
            {property.operation === "Alquiler" && (
              <p className="text-xs text-[var(--muted)]">por mes</p>
            )}
          </div>
          {mode === "client" ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="px-3"
                onClick={() => onContact?.(property)}
                aria-label="Contactar agente"
              >
                <Icon name="phone" size={16} />
              </Button>
              <Button
                disabled={requested || property.status !== "Disponible"}
                onClick={() => onRequest?.(property)}
              >
                {requested ? "Solicitada" : "Visitar"}
              </Button>
            </div>
          ) : (
            <Button variant="secondary">Ver detalle</Button>
          )}
        </div>
      </div>
    </article>
  )
}
