import PropertyCard from "../../components/PropertyCard"
import { properties } from "../../data/mockData"
import { Button, PageHeader } from "../../components/ui"

export default function AgentProperties() {
  const mine = properties.filter((item) => item.agentId === "a-01")
  return (
    <>
      <PageHeader
        eyebrow="Cartera asignada"
        title="Mis propiedades"
        description="Consulta y actualiza los inmuebles que tienes bajo responsabilidad."
        actions={<Button icon="plus">Registrar propiedad</Button>}
      />
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {mine.map((property) => (
          <PropertyCard key={property.id} property={property} mode="agent" />
        ))}
      </div>
    </>
  )
}
