import { useEffect, useState } from "react"

import DataTable from "../../components/DataTable"
import { Button, PageHeader, StatusBadge } from "../../components/ui"
import { getClientVisits, type DatabaseVisit } from "../../utils/databaseApi"

export default function ClientVisits({
  accountToken,
  onExplore,
}: {
  accountToken: string
  onExplore: () => void
}) {
  const [visits, setVisits] = useState<DatabaseVisit[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    getClientVisits(accountToken)
      .then((rows) => {
        if (active) setVisits(rows)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "No se pudieron cargar tus visitas.")
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [accountToken])

  return (
    <>
      <PageHeader
        eyebrow="Seguimiento"
        title="Mis visitas"
        description="Solicitudes y horarios asociados a tu cuenta de cliente."
        actions={<Button icon="search" onClick={onExplore}>Explorar propiedades</Button>}
      />
      {error && <p role="alert" className="mb-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}
      {isLoading ? <p className="py-10 text-center text-sm text-[var(--muted)]">Cargando tus visitas…</p> : (
        <DataTable
          headers={["Fecha", "Inmueble", "Asesor", "Estado", "Observaciones"]}
          rows={visits.map((visit) => [
            <div key={`${visit.id}-date`}><b>{visit.visit_date}</b><p className="text-xs text-[var(--accent)]">{visit.visit_time}</p></div>,
            visit.property,
            visit.agent,
            <StatusBadge key={`${visit.id}-status`} status={visit.status} />,
            visit.notes || "—",
          ])}
        />
      )}
      {!isLoading && !error && visits.length === 0 && <p className="mt-5 text-center text-sm text-[var(--muted)]">Aún no tienes visitas. Explora un inmueble disponible y solicita un horario.</p>}
    </>
  )
}
