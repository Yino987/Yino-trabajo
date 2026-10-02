import DataTable from "../../components/DataTable"
import { visits } from "../../data/mockData"
import { Button, PageHeader, StatusBadge } from "../../components/ui"

export default function AdminVisits() {
  return (
    <>
      <PageHeader
        eyebrow="Coordinación"
        title="Agenda y visitas"
        description="Programa citas y controla la confirmación, realización o cancelación de cada visita."
        actions={<Button icon="plus">Programar visita</Button>}
      />
      <DataTable
        headers={[
          "Fecha",
          "Propiedad",
          "Cliente",
          "Agente",
          "Estado",
          "Acción",
        ]}
        rows={visits.map((visit) => [
          <div>
            <p className="font-bold">{visit.date}</p>
            <p className="mt-1 text-xs text-[var(--accent)]">{visit.time}</p>
          </div>,
          visit.property,
          visit.client,
          visit.agent,
          <StatusBadge status={visit.status} />,
          <Button variant="ghost" className="px-3">
            Gestionar
          </Button>,
        ])}
      />
    </>
  )
}
