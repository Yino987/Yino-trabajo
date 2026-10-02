import { useState } from "react"
import PropertyCard from "../../components/PropertyCard"
import Icon from "../../components/Icon"
import { properties } from "../../data/mockData"
import type { Property } from "../../types"
import { Input, PageHeader } from "../../components/ui"

export default function ClientProperties({
  requested,
  onRequest,
  onContact,
}: {
  requested: string[]
  onRequest: (property: Property) => void
  onContact: (property: Property) => void
}) {
  const [search, setSearch] = useState("")
  const available = properties.filter(
    (item) =>
      item.status === "Disponible" &&
      `${item.title} ${item.district}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  )
  return (
    <>
      <div className="mb-8 overflow-hidden rounded-3xl bg-[var(--brand-strong)] p-7 text-white sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
          Propiedades seleccionadas
        </p>
        <h1 className="font-display mt-3 max-w-xl text-3xl font-bold sm:text-4xl">
          Encuentra un lugar que se sienta tuyo.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
          Explora inmuebles disponibles en Huancayo y el Valle del Mantaro.
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
            placeholder="Buscar por zona o tipo de propiedad"
            className="border-white/20 bg-white pl-11 text-[#17231d]"
          />
        </div>
      </div>
      <PageHeader
        title={`${available.length} propiedades disponibles`}
        description="Puedes solicitar una visita o contactar directamente al agente responsable."
      />
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {available.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            mode="client"
            requested={requested.includes(property.id)}
            onRequest={onRequest}
            onContact={onContact}
          />
        ))}
      </div>
    </>
  )
}
