import { useEffect, useState } from "react"

import MetricCard from "../../components/MetricCard"
import { Button, Card, PageHeader, StatusBadge } from "../../components/ui"
import { money } from "../../utils/format"
import {
  getAgentContracts,
  getAgentProperties,
  getAgentVisits,
  type DatabaseContract,
  type DatabaseVisit,
  type PublicProperty,
} from "../../utils/databaseApi"

export default function AgentDashboard({
  accountToken,
  userName,
  onNavigate,
}: {
  accountToken: string
  userName: string
  onNavigate: (page: string) => void
}) {
  const [properties, setProperties] = useState<PublicProperty[]>([])
  const [visits, setVisits] = useState<DatabaseVisit[]>([])
  const [contracts, setContracts] = useState<DatabaseContract[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    Promise.all([getAgentProperties(accountToken), getAgentVisits(accountToken), getAgentContracts(accountToken)])
      .then(([propertyRows, visitRows, contractRows]) => {
        if (!active) return
        setProperties(propertyRows)
        setVisits(visitRows)
        setContracts(contractRows)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "No se pudo cargar tu panel.")
      })
    return () => { active = false }
  }, [accountToken])

  const upcomingVisits = visits.filter((visit) =>
    ["Programada", "Confirmada"].includes(visit.status) &&
    new Date(`${visit.visit_date}T${visit.visit_time}:00`).getTime() >= Date.now(),
  )
  const volume = contracts.reduce((sum, contract) => sum + Number(contract.amount), 0)

  return (
    <>
      <PageHeader
        eyebrow="Espacio de asesor"
        title={`Hola, ${userName}`}
        description="Actividad vinculada a tu cuenta en la base de datos Inmobiliaria."
        actions={<Button onClick={() => onNavigate("visits")} icon="calendar">Abrir agenda</Button>}
      />
      {error && <p role="alert" className="mb-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Inmuebles asignados" value={String(properties.length)} note="Cartera actual" icon="building" />
        <MetricCard label="Visitas pendientes" value={String(upcomingVisits.length)} note="Programadas y confirmadas" icon="calendar" tone="accent" />
        <MetricCard label="Contratos asociados" value={String(contracts.length)} note={money(volume)} icon="chart" tone="gold" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl font-bold">Próximas visitas</h2><button onClick={() => onNavigate("visits")} className="text-sm font-bold text-[var(--brand)]">Agenda</button></div>
          <div className="space-y-3">
            {upcomingVisits.slice(0, 5).map((visit) => (
              <div key={visit.id} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-soft)] p-3">
                <div><p className="font-semibold">{visit.property}</p><p className="mt-1 text-xs text-[var(--muted)]">{visit.visit_date} · {visit.visit_time} · {visit.client}</p></div>
                <StatusBadge status={visit.status} />
              </div>
            ))}
            {!upcomingVisits.length && <p className="text-sm text-[var(--muted)]">No tienes visitas pendientes.</p>}
          </div>
        </Card>
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl font-bold">Cartera reciente</h2><button onClick={() => onNavigate("properties")} className="text-sm font-bold text-[var(--brand)]">Ver cartera</button></div>
          <div className="space-y-3">
            {properties.slice(0, 5).map((property) => (
              <div key={property.id} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-soft)] p-3">
                <div><p className="font-semibold">{property.category} · {property.address}</p><p className="mt-1 text-xs text-[var(--muted)]">{property.district} · {money(Number(property.price))}</p></div>
                <StatusBadge status={property.status ?? "Sin estado"} />
              </div>
            ))}
            {!properties.length && <p className="text-sm text-[var(--muted)]">No tienes inmuebles asignados.</p>}
          </div>
        </Card>
      </div>
    </>
  )
}
