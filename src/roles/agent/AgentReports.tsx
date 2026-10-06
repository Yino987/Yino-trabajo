import { useEffect, useState } from "react"

import DataTable from "../../components/DataTable"
import MetricCard from "../../components/MetricCard"
import { Button, PageHeader } from "../../components/ui"
import { exportCsv, money } from "../../utils/format"
import { getAgentContracts, type DatabaseContract } from "../../utils/databaseApi"

export default function AgentReports({ accountToken }: { accountToken: string }) {
  const [contracts, setContracts] = useState<DatabaseContract[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    let active = true
    getAgentContracts(accountToken)
      .then((rows) => { if (active) setContracts(rows) })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "No se pudo cargar el reporte.") })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [accountToken])

  const volume = contracts.reduce((sum, item) => sum + Number(item.amount), 0)
  const download = () => exportCsv("contratos-del-asesor.csv", contracts.map((item) => ({
    Contrato: item.id,
    Fecha: String(item.start_date).slice(0, 10),
    Inmueble: item.property,
    Cliente: item.client,
    Tipo: item.type === "venta" ? "Venta" : "Alquiler",
    Importe: Number(item.amount),
  })))

  return (
    <>
      <PageHeader
        eyebrow="Rendimiento individual"
        title="Mis resultados"
        description="Contratos y montos asociados a tu usuario, consultados desde Inmobiliaria."
        actions={<Button icon="download" onClick={download} disabled={!contracts.length}>Exportar mis contratos</Button>}
      />
      {error && <p role="alert" className="mb-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <MetricCard label="Monto contratado" value={money(volume)} note="Acumulado de contratos vinculados" icon="chart" />
        <MetricCard label="Contratos" value={String(contracts.length)} note="Asociados a tu cuenta" icon="file" tone="accent" />
      </div>
      {isLoading ? <p className="py-10 text-center text-sm text-[var(--muted)]">Cargando resultados…</p> : (
        <DataTable
          headers={["Contrato", "Fecha", "Inmueble", "Cliente", "Tipo", "Importe"]}
          rows={contracts.map((item) => [
            `#${item.id}`,
            String(item.start_date).slice(0, 10),
            item.property,
            item.client,
            item.type === "venta" ? "Venta" : "Alquiler",
            <b key={`${item.id}-amount`}>{money(Number(item.amount))}</b>,
          ])}
        />
      )}
    </>
  )
}
