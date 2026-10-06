import { useEffect, useMemo, useState, type FormEvent } from "react"

import Icon from "../../components/Icon"
import Modal from "../../components/Modal"
import { Button, Card, Input, PageHeader } from "../../components/ui"
import { money } from "../../utils/format"
import {
  getAdminAgents,
  saveAccount,
  saveAdminRecord,
  type DatabaseAgent,
} from "../../utils/databaseApi"

type AgentForm = {
  firstName: string
  lastName: string
  phone: string
  email: string
  password: string
}

const emptyForm: AgentForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
}

export default function AdminAgents({ adminToken }: { adminToken: string }) {
  const [agents, setAgents] = useState<DatabaseAgent[]>([])
  const [search, setSearch] = useState("")
  const [sortOrder, setSortOrder] = useState("Predeterminado")
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<DatabaseAgent | null>(null)
  const [viewing, setViewing] = useState<DatabaseAgent | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const loadAgents = async () => {
    setIsLoading(true)
    try {
      setAgents(await getAdminAgents(adminToken))
      setError("")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar los asesores.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadAgents()
  }, [adminToken])

  const filtered = useMemo(() => {
    const result = agents.filter((agent) =>
      `${agent.first_name} ${agent.last_name} ${agent.email ?? ""}`
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
    )
    if (sortOrder === "Mayor venta") result.sort((a, b) => b.sales - a.sales)
    if (sortOrder === "Menor venta") result.sort((a, b) => a.sales - b.sales)
    if (sortOrder === "Mayor volumen") result.sort((a, b) => b.volume - a.volume)
    return result
  }, [agents, search, sortOrder])

  const openEdit = (agent: DatabaseAgent) => {
    setEditing(agent)
    setViewing(null)
    setForm({
      firstName: agent.first_name,
      lastName: agent.last_name,
      phone: agent.phone ?? "",
      email: agent.email ?? "",
      password: "",
    })
    setIsCreating(false)
    setError("")
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError("")
    try {
      const result = await saveAdminRecord(
        adminToken,
        "agents",
        editing?.id ?? null,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
        },
      )
      const agentId = editing?.id ?? result?.id
      if (!editing && agentId) {
        setEditing({
          id: agentId,
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone || null,
          email: form.email || null,
          zone: "Sin zona asignada",
          sales: 0,
          volume: 0,
        })
        setIsCreating(false)
      }
      if (form.password && agentId) {
        await saveAccount(adminToken, "agente", agentId, form.password)
      }
      setEditing(null)
      setIsCreating(false)
      setForm(emptyForm)
      await loadAgents()
    } catch (cause) {
      await loadAgents()
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el asesor.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Equipo comercial"
        title="Asesores inmobiliarios"
        description="Datos de asesores y actividad calculada a partir de los inmuebles y contratos registrados."
        actions={<Button icon="plus" onClick={() => { setForm(emptyForm); setEditing(null); setIsCreating(true); setError("") }}>Añadir asesor</Button>}
      />
      {error && <p role="alert" className="mb-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" size={18} className="absolute left-4 top-3 text-[var(--muted)]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar asesor por nombre o correo" className="pl-11" />
        </div>
        <select className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option>Predeterminado</option>
          <option>Mayor venta</option>
          <option>Menor venta</option>
          <option>Mayor volumen</option>
        </select>
      </div>
      {isLoading ? (
        <p className="py-10 text-center text-sm text-[var(--muted)]">Cargando asesores de Inmobiliaria…</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((agent) => (
            <Card key={agent.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] font-display text-lg font-bold text-[var(--brand)]">
                    {`${agent.first_name[0] ?? ""}${agent.last_name[0] ?? ""}`}
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold">{agent.first_name} {agent.last_name}</h2>
                    <p className="mt-1 text-xs text-[var(--muted)]">{agent.zone} · ID {agent.id}</p>
                  </div>
                </div>
              </div>
              <div className="my-5 grid grid-cols-2 divide-x divide-[var(--border)] rounded-xl bg-[var(--surface-soft)] py-3 text-center">
                <div><p className="font-display text-xl font-bold">{agent.sales}</p><p className="text-xs text-[var(--muted)]">Contratos de venta</p></div>
                <div><p className="font-display text-xl font-bold">{money(agent.volume)}</p><p className="text-xs text-[var(--muted)]">Volumen contratado</p></div>
              </div>
              <div className="space-y-2 text-sm text-[var(--muted)]">
                <p className="flex items-center gap-2"><Icon name="phone" size={15} />{agent.phone || "Sin teléfono"}</p>
                <p className="flex items-center gap-2"><Icon name="user" size={15} />{agent.email || "Sin correo"}</p>
              </div>
              <div className="mt-5 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setViewing(agent)}>Ver rendimiento</Button>
                <Button variant="ghost" onClick={() => openEdit(agent)}>Editar / acceso</Button>
              </div>
            </Card>
          ))}
          {!filtered.length && <p className="col-span-full py-8 text-center text-sm text-[var(--muted)]">No hay asesores que coincidan con la búsqueda.</p>}
        </div>
      )}
      {(isCreating || editing) && (
        <Modal title={isCreating ? "Añadir asesor" : "Editar asesor y acceso"} onClose={() => { if (!isSaving) { setIsCreating(false); setEditing(null) } }}>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold">Nombres<Input required maxLength={20} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-2" /></label>
              <label className="text-sm font-semibold">Apellidos<Input required maxLength={20} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-2" /></label>
            </div>
            <label className="block text-sm font-semibold">Correo<Input type="email" maxLength={40} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2" /></label>
            <label className="block text-sm font-semibold">Teléfono<Input maxLength={9} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2" /></label>
            <label className="block text-sm font-semibold">Contraseña de acceso (opcional)
              <Input type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-2" placeholder="Mínimo 8 caracteres" />
              <span className="mt-1 block text-xs font-normal text-[var(--muted)]">El asesor podrá acceder con su correo y el perfil Agente.</span>
            </label>
            <div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={isSaving} onClick={() => { setIsCreating(false); setEditing(null) }}>Cancelar</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Guardando…" : "Guardar en Inmobiliaria"}</Button></div>
          </form>
        </Modal>
      )}
      {viewing && (
        <Modal title="Rendimiento del asesor" onClose={() => setViewing(null)}>
          <h3 className="font-display text-xl font-bold">{viewing.first_name} {viewing.last_name}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{viewing.zone}</p>
          <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-[var(--surface-soft)] p-5 text-center">
            <div><p className="text-xs text-[var(--muted)]">Contratos de venta</p><p className="font-display text-3xl font-bold text-[var(--brand)]">{viewing.sales}</p></div>
            <div><p className="text-xs text-[var(--muted)]">Volumen contratado</p><p className="font-display text-2xl font-bold text-[var(--brand)]">{money(viewing.volume)}</p></div>
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">Cálculo basado en los contratos asociados a este asesor en la base de datos.</p>
        </Modal>
      )}
    </>
  )
}
