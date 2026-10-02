import { useState } from "react"
import PropertyCard from "../../components/PropertyCard"
import { properties } from "../../data/mockData"
import Icon from "../../components/Icon"
import { Button, Input, PageHeader } from "../../components/ui"

export default function AdminProperties() {
  const [search, setSearch] = useState("")
  const filtered = properties.filter((property) =>
    `${property.title} ${property.code} ${property.district}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )
  return (
    <>
      <PageHeader
        eyebrow="Inventario"
        title="Gestión de propiedades"
        description="Registra, consulta y actualiza el ciclo de vida de cada inmueble."
        actions={<Button icon="plus">Nueva propiedad</Button>}
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon
            name="search"
            size={18}
            className="absolute left-4 top-3 text-[var(--muted)]"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, código o distrito"
            className="pl-11"
          />
        </div>
        <select className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm">
          <option>Todos los estados</option>
          <option>Disponible</option>
          <option>Reservada</option>
          <option>Vendida</option>
        </select>
      </div>
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((property) => (
          <PropertyCard key={property.id} property={property} mode="admin" />
        ))}
      </div>
    </>
  )
}
