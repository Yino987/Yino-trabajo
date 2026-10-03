import { useState } from "react"
import { agents as initialAgents } from "../../data/mockData"
import type { Agent } from "../../types"
import { money } from "../../utils/format"
import Modal from "../../components/Modal"
import {
  Button,
  Card,
  Input,
  PageHeader,
  StatusBadge,
} from "../../components/ui"
import Icon from "../../components/Icon"

export default function AdminAgents() {
  const [agents, setAgents] = useState(initialAgents)
  const [search, setSearch] = useState("")
  const [sortOrder, setSortOrder] = useState("Predeterminado")
  
  const [isCreating, setIsCreating] = useState(false)
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  const initialForm = {
    name: "",
    email: "",
    phone: "",
    zone: "",
    sales: "0",
    volume: "0",
    status: "Activo",
  }
  
  const [formData, setFormData] = useState(initialForm)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const newAgent: Agent = {
      id: `A-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      zone: formData.zone,
      sales: parseInt(formData.sales) || 0,
      volume: parseFloat(formData.volume) || 0,
      status: formData.status as Agent["status"],
    }
    setAgents([...agents, newAgent])
    setIsCreating(false)
    setFormData(initialForm)
  }

  const openEdit = (agent: Agent) => {
    setViewingAgent(null)
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      zone: agent.zone,
      sales: agent.sales.toString(),
      volume: agent.volume.toString(),
      status: agent.status,
    })
    setEditingAgent(agent)
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAgent) return
    const updated: Agent = {
      ...editingAgent,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      zone: formData.zone,
      sales: parseInt(formData.sales) || 0,
      volume: parseFloat(formData.volume) || 0,
      status: formData.status as Agent["status"],
    }
    setAgents(agents.map(a => a.id === updated.id ? updated : a))
    setEditingAgent(null)
    setFormData(initialForm)
  }

  let processedAgents = agents.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
  
  if (sortOrder === "Mayor venta") {
    processedAgents.sort((a, b) => b.sales - a.sales)
  } else if (sortOrder === "Menor venta") {
    processedAgents.sort((a, b) => a.sales - b.sales)
  } else if (sortOrder === "Mayor volumen") {
    processedAgents.sort((a, b) => b.volume - a.volume)
  }

  return (
    <>
      <PageHeader
        eyebrow="Equipo comercial"
        title="Agentes inmobiliarios"
        description="Administra accesos, zonas asignadas y desempeño de cada asesor."
        actions={
          <Button icon="plus" onClick={() => { setFormData(initialForm); setIsCreating(true); }}>
            Añadir agente
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon
            name="search"
            size={18}
            className="absolute left-4 top-3 text-[var(--muted)]"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar agente por nombre..."
            className="pl-11"
          />
        </div>
        <select 
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option>Predeterminado</option>
          <option>Mayor venta</option>
          <option>Menor venta</option>
          <option>Mayor volumen</option>
        </select>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {processedAgents.map((agent) => (
          <Card key={agent.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] font-display text-lg font-bold text-[var(--brand)]">
                  {agent.name
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold">
                    {agent.name}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {agent.zone}
                  </p>
                </div>
              </div>
              <StatusBadge status={agent.status} />
            </div>
            <div className="my-5 grid grid-cols-2 divide-x divide-[var(--border)] rounded-xl bg-[var(--surface-soft)] py-3 text-center">
              <div>
                <p className="font-display text-xl font-bold">{agent.sales}</p>
                <p className="text-xs text-[var(--muted)]">Ventas</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold">
                  {money(agent.volume)}
                </p>
                <p className="text-xs text-[var(--muted)]">Volumen</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <p className="flex items-center gap-2">
                <Icon name="phone" size={15} />
                {agent.phone}
              </p>
              <p className="flex items-center gap-2">
                <Icon name="user" size={15} />
                {agent.email}
              </p>
            </div>
            <Button variant="secondary" className="mt-5 w-full" onClick={() => setViewingAgent(agent)}>
              Ver rendimiento
            </Button>
          </Card>
        ))}
      </div>

      {(isCreating || editingAgent) && (
        <Modal title={isCreating ? "Añadir nuevo agente" : "Editar agente"} onClose={() => { setIsCreating(false); setEditingAgent(null); }}>
          <form onSubmit={isCreating ? handleCreate : handleEdit} className="space-y-4">
            <label className="block text-sm font-semibold text-[var(--text)]">
              Nombre completo
              <Input
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
                className="mt-2"
                placeholder="Ej. Ana Torres"
              />
            </label>
            <label className="block text-sm font-semibold text-[var(--text)]">
              Correo corporativo
              <Input
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                type="email"
                required
                className="mt-2"
                placeholder="ana@huancayork.pe"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-[var(--text)]">
                Teléfono
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="mt-2" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                Zona
                <Input value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} required className="mt-2" />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label className="block text-sm font-semibold text-[var(--text)]">
                Ventas
                <Input type="number" min="0" value={formData.sales} onChange={e => setFormData({...formData, sales: e.target.value})} required className="mt-2" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                Volumen (S/)
                <Input type="number" min="0" value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} required className="mt-2" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                Estado
                <select 
                  className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Activo">Activo</option>
                  <option value="Vacaciones">Vacaciones</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setIsCreating(false); setEditingAgent(null); }}
              >
                Cancelar
              </Button>
              <Button type="submit">{isCreating ? "Guardar agente" : "Actualizar agente"}</Button>
            </div>
          </form>
        </Modal>
      )}

      {viewingAgent && (
        <Modal title="Rendimiento del agente" onClose={() => setViewingAgent(null)}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-soft)] font-display text-xl font-bold text-[var(--brand)]">
                  {viewingAgent.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold">{viewingAgent.name}</h3>
                  <p className="text-sm text-[var(--muted)]">{viewingAgent.zone}</p>
                </div>
              </div>
              <StatusBadge status={viewingAgent.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-[var(--surface-soft)] p-5 text-center mt-2">
              <div>
                <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">Total Ventas</p>
                <p className="font-display text-4xl font-bold text-[var(--brand)]">{viewingAgent.sales}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">Volumen Generado</p>
                <p className="font-display text-3xl font-bold text-[var(--text)] mt-1">{money(viewingAgent.volume)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4 text-sm mt-2 flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">ID de Agente:</span>
                <span className="font-semibold">{viewingAgent.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Correo:</span>
                <span className="font-semibold">{viewingAgent.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Teléfono:</span>
                <span className="font-semibold">{viewingAgent.phone}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => openEdit(viewingAgent)}>Editar</Button>
              <Button onClick={() => setViewingAgent(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
