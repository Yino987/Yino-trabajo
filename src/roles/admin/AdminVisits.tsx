import { useEffect, useMemo, useState, type FormEvent } from "react"

import DataTable from "../../components/DataTable"
import Icon from "../../components/Icon"
import Modal from "../../components/Modal"
import { Button, Input, PageHeader, StatusBadge } from "../../components/ui"
import {
  getAdminVisits,
  getPropertyOptions,
  saveAdminRecord,
  type DatabaseVisit,
  type PropertyOptions,
} from "../../utils/databaseApi"

type VisitForm = {
  propertyId: string
  clientId: string
  agentId: string
  date: string
  time: string
  status: string
  notes: string
}

const emptyForm: VisitForm = {
  propertyId: "",
  clientId: "",
  agentId: "",
  date: "",
  time: "",
  status: "Programada",
  notes: "",
}

export default function AdminVisits({ adminToken }: { adminToken: string }) {
  const [visits, setVisits] = useState<DatabaseVisit[]>([])
  const [options, setOptions] = useState<PropertyOptions | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<DatabaseVisit | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const load = async () => {
    setIsLoading(true)
    try {
      const [visitRows, referenceOptions] = await Promise.all([
        getAdminVisits(adminToken),
        getPropertyOptions(adminToken),
      ])
      setVisits(visitRows)
      setOptions(referenceOptions)
      setError("")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar las visitas.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void load() }, [adminToken])

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    return visits.filter((visit) =>
      `${visit.property} ${visit.client} ${visit.agent} ${visit.status}`.toLocaleLowerCase().includes(term),
    )
  }, [visits, search])

  const openEdit = (visit: DatabaseVisit) => {
    setEditing(visit)
    setIsCreating(false)
    setForm({
      propertyId: String(visit.property_id),
      clientId: String(visit.client_id),
      agentId: String(visit.agent_id),
      date: visit.visit_date.slice(0, 10),
      time: visit.visit_time.slice(0, 5),
      status: visit.status,
      notes: visit.notes ?? "",
    })
    setError("")
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError("")
    try {
      await saveAdminRecord(adminToken, "visits", editing?.id ?? null, {
        propertyId: Number(form.propertyId),
        clientId: Number(form.clientId),
        agentId: Number(form.agentId),
        date: form.date,
        time: form.time,
        status: form.status,
        notes: form.notes,
      })
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
        eyebrow="Coordinación"
        title="Agenda y visitas"
        description="Visitas reales de la base de datos. Programa y actualiza fecha, responsable y seguimiento."
        actions={<Button icon="plus" onClick={() => { setForm(emptyForm); setEditing(null); setIsCreating(true); setError("") }}>Programar visita</Button>}
      />
      {error && <p role="alert" className="mb-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}
      <div className="relative mb-6">
        <Icon name="search" size={18} className="absolute left-4 top-3 text-[var(--muted)]" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por cliente, asesor o inmueble" className="pl-11" />
      </div>
      {isLoading ? <p className="py-10 text-center text-sm text-[var(--muted)]">Cargando agenda…</p> : (
        <DataTable
          headers={["Fecha", "Inmueble", "Cliente", "Asesor", "Estado", "Acción"]}
          rows={filtered.map((visit) => [
            <div key={`${visit.id}-date`}><b>{visit.visit_date}</b><p className="text-xs text-[var(--accent)]">{visit.visit_time}</p></div>,
            visit.property,
            visit.client,
            visit.agent,
            <StatusBadge key={`${visit.id}-status`} status={visit.status} />,
            <Button key={`${visit.id}-edit`} variant="secondary" onClick={() => openEdit(visit)}>Gestionar</Button>,
          ])}
        />
      )}
      {(isCreating || editing) && (
        <Modal title={isCreating ? "Programar visita" : "Actualizar visita"} onClose={() => { if (!isSaving) { setIsCreating(false); setEditing(null) } }}>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold">Inmueble
              <select required className={selectClass} value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })}>
                <option value="">Selecciona un inmueble</option>
                {options?.properties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold">Cliente
                <select required className={selectClass} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                  <option value="">Selecciona un cliente</option>
                  {options?.clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold">Asesor
                <select required className={selectClass} value={form.agentId} onChange={(e) => setForm({ ...form, agentId: e.target.value })}>
                  <option value="">Selecciona un asesor</option>
                  {options?.agents.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold">Fecha<Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-2" /></label>
              <label className="text-sm font-semibold">Hora<Input type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="mt-2" /></label>
            </div>
            <label className="block text-sm font-semibold">Estado
              <select className={selectClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {["Programada", "Confirmada", "Realizada", "Cancelada"].map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Observaciones<Input maxLength={300} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-2" /></label>
            <div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={isSaving} onClick={() => { setIsCreating(false); setEditing(null) }}>Cancelar</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Guardando…" : "Guardar en Inmobiliaria"}</Button></div>
          </form>
        </Modal>
      )}
    </>
  )
}
