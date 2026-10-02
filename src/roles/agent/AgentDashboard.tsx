import MetricCard from "../../components/MetricCard"
import DataTable from "../../components/DataTable"
import { contracts, properties, visits } from "../../data/mockData"
import { money } from "../../utils/format"
import { Button, Card, PageHeader, StatusBadge } from "../../components/ui"

export default function AgentDashboard({
  onNavigate,
}: {
  onNavigate: (page: string) => void
}) {
  const myProperties = properties.filter((item) => item.agentId === "a-01")
  const myVisits = visits.filter((item) => item.agentId === "a-01")
  const myContracts = contracts.filter((item) => item.agentId === "a-01")
  return (
    <>
      <PageHeader
        eyebrow="Espacio de agente"
        title="Hola, Valeria"
        description="Prioridades, agenda y avance de tu cartera comercial."
        actions={
          <Button onClick={() => onNavigate("visits")} icon="calendar">
            Abrir agenda
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Propiedades asignadas"
          value={String(myProperties.length)}
          note="3 disponibles"
          icon="building"
        />
        <MetricCard
          label="Visitas próximas"
          value={String(myVisits.length)}
          note="2 por confirmar"
          icon="calendar"
          tone="accent"
        />
        <MetricCard
          label="Ventas del periodo"
          value="8"
          note="Objetivo: 10 ventas"
          icon="chart"
          tone="gold"
        />
        <MetricCard
          label="Comisión estimada"
          value="S/ 24,600"
          note="+12% este mes"
          icon="badge"
          tone="info"
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            Objetivo mensual
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold">
            8 de 10 operaciones
          </h2>
          <div className="my-6 h-3 overflow-hidden rounded-full bg-[var(--surface-soft)]">
            <div className="h-full w-4/5 rounded-full bg-[var(--brand)]" />
          </div>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Estás a dos operaciones de superar tu meta. Hay tres clientes con
            alta intención de compra.
          </p>
          <Button
            variant="secondary"
            className="mt-5 w-full"
            onClick={() => onNavigate("reports")}
          >
            Ver resultados
          </Button>
        </Card>
        <div>
          <h2 className="font-display mb-4 text-xl font-bold">
            Agenda inmediata
          </h2>
          <DataTable
            headers={["Fecha", "Propiedad", "Cliente", "Estado"]}
            rows={myVisits.map((visit) => [
              <b>
                {visit.date} · {visit.time}
              </b>,
              visit.property,
              visit.client,
              <StatusBadge status={visit.status} />,
            ])}
          />
        </div>
      </div>
      <Card className="mt-6 p-6">
        <div className="flex justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">
              Volumen gestionado
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Contratos asociados a tu cuenta
            </p>
          </div>
          <p className="font-display text-2xl font-bold text-[var(--brand)]">
            {money(myContracts.reduce((sum, item) => sum + item.amount, 0))}
          </p>
        </div>
      </Card>
    </>
  )
}
