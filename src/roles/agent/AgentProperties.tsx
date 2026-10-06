import { useEffect, useState } from "react"

import PropertyCard from "../../components/PropertyCard"
import Modal from "../../components/Modal"
import { PageHeader } from "../../components/ui"
import { money } from "../../utils/format"
import type { Property } from "../../types"
import { getAgentProperties } from "../../utils/databaseApi"
import { mapDatabaseProperty } from "../../utils/propertyMapper"

export default function AgentProperties({ accountToken }: { accountToken: string }) {
  const [properties, setProperties] = useState<Property[]>([])
  const [viewing, setViewing] = useState<Property | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    getAgentProperties(accountToken)
      .then((rows) => {
        if (active) setProperties(rows.map(mapDatabaseProperty))
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "No se pudo cargar tu cartera.")
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [accountToken])

  return (
    <>
      <PageHeader eyebrow="Cartera asignada" title="Mis inmuebles" description="Propiedades asignadas a tu usuario en Inmobiliaria." />
      {error && <p role="alert" className="mb-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}
      {isLoading ? <p className="py-10 text-center text-sm text-[var(--muted)]">Cargando tu cartera…</p> : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {properties.map((property) => <PropertyCard key={property.id} property={property} mode="agent" onViewDetail={setViewing} />)}
          {!properties.length && <p className="col-span-full py-8 text-center text-sm text-[var(--muted)]">No hay inmuebles asignados a este asesor.</p>}
        </div>
      )}
      {viewing && (
        <Modal title="Detalle del inmueble" onClose={() => setViewing(null)}>
          <img src={viewing.image} alt={viewing.title} className="h-48 w-full rounded-xl object-cover" />
          <h2 className="mt-4 font-display text-2xl font-bold">{viewing.title}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{viewing.address} · {viewing.district}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[var(--surface-soft)] p-4 text-sm">
            <p>Estado: <b>{viewing.status}</b></p>
            <p>Tipo: <b>{viewing.operation}</b></p>
            <p>Área: <b>{viewing.area} m²</b></p>
            <p>Dormitorios: <b>{viewing.bedrooms}</b></p>
            <p>Baños: <b>{viewing.bathrooms}</b></p>
            <p>Precio: <b>{money(viewing.price)}</b></p>
          </div>
        </Modal>
      )}
    </>
  )
}
