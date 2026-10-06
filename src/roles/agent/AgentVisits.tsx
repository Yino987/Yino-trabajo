import { useEffect, useState, type FormEvent } from "react"

import DataTable from "../../components/DataTable"
import Modal from "../../components/Modal"
import { Button, Input, PageHeader, StatusBadge } from "../../components/ui"
import {
  createAgentVisit,
  getAgentVisits,
  getAgentVisitOptions,
  updateAgentVisit,
  type DatabaseVisit,
} from "../../utils/databaseApi"

type AgentOptions = Awaited<ReturnType<typeof getAgentVisitOptions>>

export default function AgentVisits({ accountToken }: { accountToken: string }) {
  const [visits, setVisits] = useState<DatabaseVisit[]>([])
  const [options, setOptions] = useState<AgentOptions | null>(null)
  const [editing, setEditing] = useState<DatabaseVisit | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({ propertyId: "", clientId: "", date: "", time: "", status: "Programada", notes: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const load = async () => {
    setIsLoading(true)
    try {
      const [rows, refs] = await Promise.all([getAgentVisits(accountToken), getAgentVisitOptions(accountToken)])
      setVisits(rows)
      setOptions(refs)
      setError("")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar tus visitas.")
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => { void load() }, [accountToken])

  const openEdit = (visit: DatabaseVisit) => {
    setEditing(visit)
    setIsCreating(false)
    setForm({
      propertyId: String(visit.property_id),
      clientId: String(visit.client_id),
      date: visit.visit_date.slice(0, 10),
      time: visit.visit_time.slice(0, 5),
      status: visit.status,
      notes: visit.notes ?? "",
    })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError("")
    try {
      if (editing) {
        await updateAgentVisit(accountToken, editing.id, form.status, form.notes)
      } else {
        await createAgentVisit(accountToken, {
          propertyId: Number(form.propertyId),
          clientId: Number(form.clientId),
          date: form.date,
          time: form.time,
          notes: form.notes,
        })
      }
      setEditing(null)
      setIsCreating(false)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la visita.")
    } finally {
      setIsSaving(false)
    }
  }

  const selectClass = "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
  return (
    <>
      <PageHeader
        eyebrow="Agenda personal"
        title="Mis visitas"
        description="Visitas asignadas a tu cuenta. Actualiza el seguimiento o agenda un recorrido para tu cartera."
        actions={<Button icon="plus" onClick={() => { setForm({ propertyId: "", clientId: "", date: "", time: "", status: "Programada", notes: "" }); setEditing(null); setIsCreating(true); setError("") }}>Nueva visita</Button>}
      />
      {error && <p role="alert" className="mb-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}
      {isLoading ? <p className="py-10 text-center text-sm text-[var(--muted)]">Cargando agenda…</p> : (
        <DataTable
          headers={["Fecha", "Inmueble", "Cliente", "Estado", "Seguimiento"]}
          rows={visits.map((visit) => [
            <div key={`${visit.id}-date`}><b>{visit.visit_date}</b><p className="text-xs text-[var(--accent)]">{visit.visit_time}</p></div>,
            visit.property,
            visit.client,
            <StatusBadge key={`${visit.id}-status`} status={visit.status} />,
            <Button key={`${visit.id}-update`} variant="secondary" onClick={() => openEdit(visit)}>Actualizar</Button>,
          ])}
        />
      )}
      {isCreating && (
        <Modal title="Agendar visita" onClose={() => { if (!isSaving) setIsCreating(false) }}>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold">Inmueble de tu cartera
              <select required className={selectClass} value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })}>
                <option value="">Selecciona un inmueble</option>
                {options?.properties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Cliente
              <select required className={selectClass} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                <option value="">Selecciona un cliente</option>
                {options?.clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold">Fecha<Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-2" /></label>
              <label className="text-sm font-semibold">Hora<Input type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="mt-2" /></label>
            </div>
            <label className="block text-sm font-semibold">Observaciones<Input maxLength={300} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-2" /></label>
            <div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={isSaving} onClick={() => setIsCreating(false)}>Cancelar</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Guardando…" : "Agendar"}</Button></div>
          </form>
        </Modal>
      )}
      {editing && (
        <Modal title={`Actualizar visita · ${editing.property}`} onClose={() => { if (!isSaving) setEditing(null) }}>
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-[var(--muted)]">{editing.visit_date} · {editing.visit_time} · {editing.client}</p>
            <label className="block text-sm font-semibold">Estado
              <select className={selectClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {["Programada", "Confirmada", "Realizada", "Cancelada"].map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Observaciones<Input maxLength={300} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-2" /></label>
            <div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={isSaving} onClick={() => setEditing(null)}>Cancelar</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Guardando…" : "Guardar seguimiento"}</Button></div>
          </form>
        </Modal>
      )}
    </>
  )
}
