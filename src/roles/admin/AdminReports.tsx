import { useState } from "react"
import DataTable from "../../components/DataTable"
import MetricCard from "../../components/MetricCard"
import { agents, contracts, visits } from "../../data/mockData"
import { exportCsv, money } from "../../utils/format"
import { Button, Card, PageHeader, StatusBadge } from "../../components/ui"
import Modal from "../../components/Modal"
import Icon from "../../components/Icon"

export default function AdminReports() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportRange, setExportRange] = useState("Todos")

  // Dynamic Metrics Calculated from Data
  const totalVolume = contracts.reduce((sum, item) => sum + item.amount, 0)
  const activeContracts = contracts.filter((item) => item.status === "Activo").length
  const conversionRate = visits.length > 0 ? ((contracts.length / visits.length) * 100).toFixed(1) : "0.0"

  // Dynamic Agent Participation Calculation
  const agentStats = agents.map(agent => {
    const agentContracts = contracts.filter(c => c.agentId === agent.id)
    const volume = agentContracts.reduce((sum, c) => sum + c.amount, 0)
    return { ...agent, volume }
  }).sort((a, b) => b.volume - a.volume)

  const maxAgentVolume = Math.max(...agentStats.map(a => a.volume), 1)

  const handleExport = () => {
    let filteredContracts = contracts
    
    if (exportRange === "Este año") {
      filteredContracts = contracts.filter(c => c.date.includes("2026"))
    } else if (exportRange === "Último mes") {
      filteredContracts = contracts.filter(c => c.date.includes("Jun 2026"))
    }

    exportCsv(
      `ventas-huancayork-${exportRange.replace(' ', '-').toLowerCase()}.csv`,
      filteredContracts.map((item) => ({
        Contrato: item.id,
        Fecha: item.date,
        Propiedad: item.property,
        Cliente: item.client,
        Agente: item.agent,
        Tipo: item.type,
        Importe: item.amount,
        Estado: item.status,
      }))
    )
    setIsExporting(false)
  }

  return (
    <>
      <PageHeader
        eyebrow="Análisis"
        title="Reportes comerciales"
        description="Indicadores para gerencia y archivo físico. Exporta el detalle en formato compatible con Excel."
        actions={
          <Button icon="download" onClick={() => setIsExporting(true)}>
            Exportar datos
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Volumen comercial (Total)"
          value={money(totalVolume)}
          note="Suma de todos los contratos"
          icon="chart"
        />
        <MetricCard
          label="Contratos activos"
          value={String(activeContracts)}
          note="En proceso actualmente"
          icon="file"
          tone="accent"
        />
        <MetricCard
          label="Conversión"
          value={`${conversionRate}%`}
          note="Visitas vs Contratos"
          icon="badge"
          tone="gold"
        />
      </div>
      <Card className="my-6 p-6">
        <h2 className="font-display text-xl font-bold">
          Participación por agente
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Volumen comercial generado por cada agente inmobiliario (Dinámico)
        </p>
        <div className="mt-6 space-y-5">
          {agentStats.map((agent) => (
            <div key={agent.id}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold">{agent.name}</span>
                <span className="text-[var(--muted)]">
                  {money(agent.volume)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
                  style={{ width: `${Math.max(2, (agent.volume / maxAgentVolume) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <h3 className="font-display text-xl font-bold mb-4 mt-8">Actividad Reciente (Contratos)</h3>
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
          <b key={item.id}>{money(item.amount)}</b>,
          <StatusBadge status={item.status} key={`${item.id}-status`} />,
        ])}
      />

      {isExporting && (
        <Modal title="Exportar Reporte a Excel / CSV" onClose={() => setIsExporting(false)}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--text)]">Selecciona el rango de fechas para el cual deseas exportar los contratos comerciales.</p>
            
            <label className="block text-sm font-semibold text-[var(--text)]">
              Rango de tiempo
              <select 
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                value={exportRange}
                onChange={e => setExportRange(e.target.value)}
              >
                <option value="Todos">Todo el historial</option>
                <option value="Este año">Este año (2026)</option>
                <option value="Último mes">Último mes (Junio)</option>
              </select>
            </label>

            <div className="mt-4 flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={() => setIsExporting(false)}>Cancelar</Button>
              <Button icon="download" onClick={handleExport}>Descargar CSV</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
