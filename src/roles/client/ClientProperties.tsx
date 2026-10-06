import { useEffect, useMemo, useState } from "react"

import PropertyCard from "../../components/PropertyCard"

import Icon from "../../components/Icon"

import type { Property } from "../../types"
import { getPublicProperties } from "../../utils/databaseApi"
import { Input, PageHeader } from "../../components/ui"
import { mapDatabaseProperty } from "../../utils/propertyMapper"
import Modal from "../../components/Modal"
import PropertyComments from "../../components/PropertyComments"
import { money } from "../../utils/format"

export default function ClientProperties({
  requested,

  onRequest,

  onContact,

  onAcquire,
}: {
  requested: string[]

  onRequest: (property: Property) => void

  onContact: (property: Property) => void

  onAcquire: (property: Property) => void
}) {
  const [search, setSearch] = useState("")

  const [properties, setProperties] = useState<Property[]>([])

  const [error, setError] = useState("")

  const [isLoading, setIsLoading] = useState(true)
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null)

  useEffect(() => {
    let active = true

    getPublicProperties()

      .then((rows) => {
        if (active) setProperties(rows.map(mapDatabaseProperty))
      })

      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "No se pudieron cargar los inmuebles.",
          )
        }
      })

      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const filteredProperties = useMemo(
    () =>
      properties.filter((item) =>
        `${item.title} ${item.district} ${item.address} ${item.status}`

          .toLocaleLowerCase()

          .includes(search.trim().toLocaleLowerCase()),
      ),

    [properties, search],
  )

  return (
    <>
      <div className="mb-8 overflow-hidden rounded-3xl bg-[var(--brand-strong)] p-7 text-white sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
          Inmobiliaria · catálogo local
        </p>
        <h1 className="font-display mt-3 max-w-xl text-3xl font-bold sm:text-4xl">
          Encuentra un lugar que se sienta tuyo.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
          Consulta los inmuebles registrados en la base de datos inmobiliaria.
        </p>
        <div className="relative mt-6 max-w-2xl">
          <Icon
            name="search"
            className="absolute left-4 top-3.5 text-[var(--muted)]"
            size={18}
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por zona, tipo o estado"
            className="border-white/20 bg-white pl-11 text-[#17231d]"
          />
        </div>
      </div>
      <PageHeader
        title={`${filteredProperties.length} inmuebles`}
        description="Se muestran los inmuebles de todos los estados. Los datos personales de clientes y contratos no se publican en esta vista."
      />
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          {error}
        </div>
      )}
      {isLoading ? (
        <p className="py-12 text-center text-sm text-[var(--muted)]">
          Cargando inmuebles de la base local…
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              mode="client"
              requested={requested.includes(property.id)}
              onRequest={onRequest}
              onContact={onContact}

              onAcquire={onAcquire}
              onViewDetail={setViewingProperty}
            />
          ))}
          {!error && filteredProperties.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-[var(--muted)]">
              {properties.length
                ? "No hay inmuebles que coincidan con tu búsqueda."
                : "La base de datos no contiene inmuebles registrados."}
            </p>
          )}
        </div>
      )}
      {viewingProperty && (
        <Modal
          title="Resumen del inmueble y comentarios"
          onClose={() => setViewingProperty(null)}
        >
          <div className="flex flex-col gap-4">
            <img
              src={viewingProperty.image}
              alt={viewingProperty.title}
              className="h-48 w-full rounded-xl object-cover"
            />
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold">
                {viewingProperty.title}
              </h2>
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand)]">
                {viewingProperty.status}
              </span>
            </div>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Inmueble de tipo {viewingProperty.operation}, ubicado en{" "}
              {viewingProperty.address}. Cuenta con {viewingProperty.area} m²,{" "}
              {viewingProperty.bedrooms} habitaciones y{" "}
              {viewingProperty.bathrooms} baños.
            </p>
            <p className="font-display text-2xl font-bold text-[var(--brand)]">
              {money(viewingProperty.price)}
            </p>
            <PropertyComments propertyId={viewingProperty.id} mode="client" />
          </div>
        </Modal>
      )}
    </>
  )
}
