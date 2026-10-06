import { useEffect, useState } from "react"

import DataTable from "../../components/DataTable"
import { PageHeader } from "../../components/ui"
import { money } from "../../utils/format"
import { getClientContracts, type DatabaseContract } from "../../utils/databaseApi"

export default function ClientContracts({ accountToken }: { accountToken: string }) {
  const [contracts, setContracts] = useState<DatabaseContract[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    getClientContracts(accountToken)
      .then((rows) => {
        if (active) setContracts(rows)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "No se pudieron cargar tus contratos.")
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [accountToken])

  return (
    <>
      <PageHeader eyebrow="Documentos" title="Mis contratos" description="Contratos registrados y asociados a tu cuenta en Inmobiliaria." />
      {error && <p role="alert" className="mb-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}
      {isLoading ? <p className="py-10 text-center text-sm text-[var(--muted)]">Cargando tus contratos…</p> : (
        <DataTable
          headers={["Contrato", "Inmueble", "Tipo", "Fecha", "Importe", "Fin"]}
          rows={contracts.map((item) => [
            <b key={`${item.id}-id`}>#{item.id}</b>,
            item.property,
            item.type === "venta" ? "Venta" : "Alquiler",
            String(item.start_date).slice(0, 10),
            <b key={`${item.id}-amount`}>{money(Number(item.amount))}</b>,
            item.end_date ? String(item.end_date).slice(0, 10) : "—",
          ])}
        />
      )}
      {!isLoading && !error && contracts.length === 0 && <p className="mt-5 text-center text-sm text-[var(--muted)]">No hay contratos asociados a tu cuenta.</p>}
    </>
  )
}
