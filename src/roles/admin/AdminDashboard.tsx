import { useEffect, useMemo, useState } from "react"

import Icon from "../../components/Icon"
import MetricCard from "../../components/MetricCard"
import { Button, Card, PageHeader, StatusBadge } from "../../components/ui"
import { money } from "../../utils/format"
import {
  getAdminAgents,
  getAdminDashboard,
  getAdminProperties,
  getAdminVisits,
  type DatabaseAgent,
  type DatabaseVisit,
} from "../../utils/databaseApi"
import { mapDatabaseProperty } from "../../utils/propertyMapper"
import type { Property } from "../../types"

type DashboardData = {
  activeProperties: number
  upcomingVisits: number
  sales: number
  activeAgents: number
}

export default function AdminDashboard({
  onNavigate,
  adminName,
  adminToken,
}: {
  onNavigate: (page: string) => void
  adminName: string
  adminToken: string
}) {
  const [summary, setSummary] = useState<DashboardData | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [visits, setVisits] = useState<DatabaseVisit[]>([])
  const [agents, setAgents] = useState<DatabaseAgent[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    Promise.all([
      getAdminDashboard(adminToken),
      getAdminProperties(adminToken),
      getAdminVisits(adminToken),
      getAdminAgents(adminToken),
    ])
      .then(([counts, propertyRows, visitRows, agentRows]) => {
        if (!active) return
        setSummary(counts)
        setProperties(propertyRows.map(mapDatabaseProperty))
        setVisits(visitRows)
        setAgents(agentRows)
        setError("")
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "No se pudo cargar el panel desde Inmobiliaria.")
        }
      })
    return () => {
      active = false
    }
  }, [adminToken])

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>()
    properties.forEach((property) => {
      counts.set(property.status, (counts.get(property.status) ?? 0) + 1)
    })
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [properties])
  const maxStatusCount = Math.max(1, ...statusCounts.map(([, count]) => count))
  const upcomingVisits = visits
    .filter((visit) =>
      ["Programada", "Confirmada"].includes(visit.status) &&
      new Date(`${visit.visit_date}T${visit.visit_time}:00`).getTime() >= Date.now(),
    )
    .slice(0, 3)

  return (
    <>
      <PageHeader
        eyebrow="Panel administrativo"
        title={`Buenos días, ${adminName}`}
        description="Resumen calculado a partir de los registros actuales de Inmobiliaria."
        actions={<Button icon="download" variant="secondary" onClick={() => onNavigate("reports")}>Ir a reportes</Button>}
      />
      {error && <p role="alert" className="mb-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Propiedades disponibles" value={summary ? String(summary.activeProperties) : "—"} note="Estado actual de los inmuebles" icon="building" />
        <MetricCard label="Visitas programadas" value={summary ? String(summary.upcomingVisits) : "—"} note="Programadas y confirmadas" icon="calendar" tone="accent" />
        <MetricCard label="Monto de ventas" value={summary ? money(summary.sales) : "—"} note="Monto total registrado" icon="chart" tone="gold" />
        <MetricCard label="Asesores registrados" value={summary ? String(summary.activeAgents) : "—"} note="Total en la base de datos" icon="badge" tone="info" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold">Inventario por estado</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{properties.length} inmuebles de la base de datos</p>
          </div>
          <div className="space-y-4">
            {statusCounts.map(([status, count]) => (
              <div key={status}>
                <div className="mb-1 flex justify-between text-sm"><span>{status}</span><b>{count}</b></div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                  <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${(count / maxStatusCount) * 100}%` }} />
                </div>
              </div>
            ))}
            {!properties.length && <p className="text-sm text-[var(--muted)]">No hay inmuebles para mostrar.</p>}
          </div>
        </Card>
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Próximas visitas</h2>
            <button onClick={() => onNavigate("visits")} className="text-xs font-bold text-[var(--brand)]">Ver agenda</button>
          </div>
          <div className="space-y-3">
            {upcomingVisits.map((visit) => (
              <div key={visit.id} className="flex gap-3 rounded-xl bg-[var(--surface-soft)] p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--accent)]"><Icon name="calendar" size={18} /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{visit.property}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{visit.visit_date} · {visit.visit_time}</p>
                </div>
                <StatusBadge status={visit.status} />
              </div>
            ))}
            {!upcomingVisits.length && <p className="text-sm text-[var(--muted)]">No hay visitas pendientes.</p>}
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <div><h2 className="font-display text-xl font-bold">Inventario destacado</h2><p className="mt-1 text-sm text-[var(--muted)]">Primeros inmuebles registrados en la base</p></div>
          <button onClick={() => onNavigate("properties")} className="text-sm font-bold text-[var(--brand)]">Ver todas</button>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {properties.slice(0, 3).map((property) => (
            <div key={property.id} className="flex items-center gap-4 px-6 py-4">
              <img src={property.image} alt="" className="h-14 w-18 rounded-xl object-cover" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{property.title}</p><p className="mt-1 text-xs text-[var(--muted)]">{property.code} · {property.district}</p></div>
              <StatusBadge status={property.status} />
              <p className="hidden w-28 text-right text-sm font-bold sm:block">{money(property.price)}</p>
            </div>
          ))}
          {!properties.length && <p className="p-6 text-sm text-[var(--muted)]">No hay inmuebles para mostrar.</p>}
        </div>
      </Card>
      <Card className="mt-6 p-5">
        <h2 className="font-display text-lg font-bold">Equipo registrado</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{agents.length} asesores. Rendimiento actualizado desde contratos.</p>
      </Card>
    </>
  )
}
