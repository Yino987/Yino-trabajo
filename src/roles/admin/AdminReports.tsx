import DataTable from "../../components/DataTable"
import MetricCard from "../../components/MetricCard"
import { agents, contracts } from "../../data/mockData"
import { exportCsv, money } from "../../utils/format"
import { Button, Card, PageHeader, StatusBadge } from "../../components/ui"

export default function AdminReports() {
  const exportSales = () =>
    exportCsv(
      "ventas-huancayork-2026.csv",
      contracts.map((item) => ({
        Contrato: item.id,
        Fecha: item.date,
        Propiedad: item.property,
        Cliente: item.client,
        Agente: item.agent,
        Tipo: item.type,
        Importe: item.amount,
        Estado: item.status,
      })),
    )
  return (
    <>
      <PageHeader
        eyebrow="Análisis"
        title="Reportes comerciales"
        description="Indicadores para gerencia y archivo físico. Exporta el detalle en formato compatible con Excel."
        actions={
          <Button icon="download" onClick={exportSales}>
            Exportar ventas CSV
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Volumen vendido"
          value={money(
            contracts
              .filter((item) => item.type === "Venta")
              .reduce((sum, item) => sum + item.amount, 0),
          )}
          note="Acumulado 2026"
          icon="chart"
        />
        <MetricCard
          label="Contratos activos"
          value={String(
            contracts.filter((item) => item.status === "Activo").length,
          )}
          note="Venta y alquiler"
          icon="file"
          tone="accent"
        />
        <MetricCard
          label="Conversión"
          value="34.8%"
          note="Visita a contrato"
          icon="badge"
          tone="gold"
        />
      </div>
      <Card className="my-6 p-6">
        <h2 className="font-display text-xl font-bold">
          Participación por agente
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Volumen comercial acumulado
        </p>
        <div className="mt-6 space-y-5">
          {agents.map((agent) => (
            <div key={agent.id}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold">{agent.name}</span>
                <span className="text-[var(--muted)]">
                  {money(agent.volume)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--brand)]"
                  style={{ width: `${Math.max(18, agent.volume / 16000)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <DataTable
        headers={[
          "Contrato",
          "Fecha",
          "Agente",
          "Cliente",
          "Tipo",
          "Importe",
          "Estado",
        ]}
        rows={contracts.map((item) => [
          item.id,
          item.date,
          item.agent,
          item.client,
          item.type,
          <b>{money(item.amount)}</b>,
          <StatusBadge status={item.status} />,
        ])}
      />
    </>
  )
}
