import { visits } from "../../data/mockData"
import DataTable from "../../components/DataTable"
import { Button, Card, PageHeader, StatusBadge } from "../../components/ui"
import Icon from "../../components/Icon"

export default function ClientVisits({
  requestedCount,
  onExplore,
}: {
  requestedCount: number
  onExplore: () => void
}) {
  const mine = visits.filter((item) => item.clientId === "c-01")
  return (
    <>
      <PageHeader
        eyebrow="Seguimiento"
        title="Mis visitas"
        description="Consulta horarios confirmados y solicitudes enviadas."
        actions={
          <Button icon="search" onClick={onExplore}>
            Explorar propiedades
          </Button>
        }
      />
      {requestedCount > 0 && (
        <Card className="mb-5 flex items-center gap-4 border-[var(--brand)] p-4">
          <div className="rounded-full bg-[var(--brand-soft)] p-2 text-[var(--brand)]">
            <Icon name="check" />
          </div>
          <div>
            <p className="font-bold">Solicitud enviada correctamente</p>
            <p className="text-sm text-[var(--muted)]">
              Un agente se comunicará contigo para coordinar la fecha.
            </p>
          </div>
        </Card>
      )}
      <DataTable
        headers={["Fecha", "Propiedad", "Agente", "Estado", "Acción"]}
        rows={mine.map((visit) => [
          <div>
            <b>{visit.date}</b>
            <p className="text-xs text-[var(--accent)]">{visit.time}</p>
          </div>,
          visit.property,
          visit.agent,
          <StatusBadge status={visit.status} />,
          <Button variant="secondary">Ver detalle</Button>,
        ])}
      />
    </>
  )
}
