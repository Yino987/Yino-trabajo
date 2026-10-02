import { contracts } from "../../data/mockData"
import { exportCsv, money } from "../../utils/format"
import DataTable from "../../components/DataTable"
import MetricCard from "../../components/MetricCard"
import { Button, PageHeader, StatusBadge } from "../../components/ui"

export default function AgentReports() {
  const mine = contracts.filter((item) => item.agentId === "a-01")
  const download = () =>
    exportCsv(
      "ventas-valeria-rojas.csv",
      mine.map((item) => ({
        Contrato: item.id,
        Fecha: item.date,
        Propiedad: item.property,
        Cliente: item.client,
        Tipo: item.type,
        Importe: item.amount,
        Estado: item.status,
      })),
    )
  return (
    <>
      <PageHeader
        eyebrow="Rendimiento individual"
        title="Mis resultados"
        description="Resumen de tus operaciones y archivo exportable para impresión o análisis."
        actions={
          <Button icon="download" onClick={download}>
            Exportar mis ventas
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Volumen total"
          value={money(mine.reduce((sum, item) => sum + item.amount, 0))}
          note="Acumulado"
          icon="chart"
        />
        <MetricCard
          label="Contratos"
          value={String(mine.length)}
          note="Asociados a tu cuenta"
          icon="file"
          tone="accent"
        />
        <MetricCard
          label="Conversión"
          value="42%"
          note="Visita a cierre"
          icon="badge"
          tone="gold"
        />
      </div>
      <DataTable
        headers={[
          "Contrato",
          "Fecha",
          "Propiedad",
          "Cliente",
          "Importe",
          "Estado",
        ]}
        rows={mine.map((item) => [
          item.id,
          item.date,
          item.property,
          item.client,
          <b>{money(item.amount)}</b>,
          <StatusBadge status={item.status} />,
        ])}
      />
    </>
  )
}
