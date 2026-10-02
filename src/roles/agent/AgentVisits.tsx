import DataTable from "../../components/DataTable"
import { visits } from "../../data/mockData"
import { Button, PageHeader, StatusBadge } from "../../components/ui"

export default function AgentVisits() {
  const mine = visits.filter((item) => item.agentId === "a-01")
  return (
    <>
      <PageHeader
        eyebrow="Agenda personal"
        title="Mis visitas"
        description="Confirma horarios y registra el resultado de cada recorrido."
        actions={<Button icon="plus">Nueva visita</Button>}
      />
      <DataTable
        headers={["Fecha", "Propiedad", "Cliente", "Estado", "Seguimiento"]}
        rows={mine.map((visit) => [
          <div>
            <b>{visit.date}</b>
            <p className="text-xs text-[var(--accent)]">{visit.time}</p>
          </div>,
          visit.property,
          visit.client,
          <StatusBadge status={visit.status} />,
          <Button variant="secondary">Actualizar</Button>,
        ])}
      />
    </>
  )
}
