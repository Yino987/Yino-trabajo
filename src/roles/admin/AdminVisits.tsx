import { useState } from "react"
import DataTable from "../../components/DataTable"
import { visits as initialVisits, properties, clients, agents } from "../../data/mockData"
import type { Visit } from "../../types"
import { Button, Input, PageHeader, StatusBadge } from "../../components/ui"
import Modal from "../../components/Modal"
import Icon from "../../components/Icon"

// Helper to convert mock date "18 Jun 2026" to "2026-06-18" for the native date input
function parseMockDate(d: string) {
  const months: Record<string, string> = { 
    Ene:"01", Feb:"02", Mar:"03", Abr:"04", May:"05", Jun:"06", 
    Jul:"07", Ago:"08", Sep:"09", Oct:"10", Nov:"11", Dic:"12",
    Jan:"01", Aug:"08", Dec:"12" // Fallbacks just in case
  };
  const parts = d.split(" ");
  if (parts.length === 3 && months[parts[1]]) {
    return `${parts[2]}-${months[parts[1]]}-${parts[0].padStart(2, '0')}`;
  }
  return d;
}

// Convert native "YYYY-MM-DD" to "18 Jun 2026"
function formatToMockDate(d: string) {
  if (!d) return d;
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
}

export default function AdminVisits() {
  const [localVisits, setLocalVisits] = useState(initialVisits)
  const [search, setSearch] = useState("")
  
  const [isCreating, setIsCreating] = useState(false)
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)

  const initialForm = {
    propertyId: properties[0]?.id || "",
    clientId: clients[0]?.id || "",
    agentId: agents[0]?.id || "",
    date: "",
    time: "",
    status: "Programada",
  }
  
  const [formData, setFormData] = useState(initialForm)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedProp = properties.find(p => p.id === formData.propertyId)
    const selectedClient = clients.find(c => c.id === formData.clientId)
    const selectedAgent = agents.find(a => a.id === formData.agentId)

    const newVisit: Visit = {
      id: `v-${Date.now()}`,
      propertyId: formData.propertyId,
      property: selectedProp?.title || "",
      clientId: formData.clientId,
      client: selectedClient?.name || "",
      agentId: formData.agentId,
      agent: selectedAgent?.name || "",
      date: formatToMockDate(formData.date),
      time: formData.time,
      status: formData.status as Visit["status"],
    }
    setLocalVisits([newVisit, ...localVisits])
    setIsCreating(false)
    setFormData(initialForm)
  }

  const openEdit = (visit: Visit) => {
    setFormData({
      propertyId: visit.propertyId,
      clientId: visit.clientId,
      agentId: visit.agentId,
      date: parseMockDate(visit.date),
      time: visit.time,
      status: visit.status,
    })
    setEditingVisit(visit)
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVisit) return
    
    const selectedProp = properties.find(p => p.id === formData.propertyId)
    const selectedClient = clients.find(c => c.id === formData.clientId)
    const selectedAgent = agents.find(a => a.id === formData.agentId)

    const updatedVisit: Visit = {
      ...editingVisit,
      propertyId: formData.propertyId,
      property: selectedProp?.title || "",
      clientId: formData.clientId,
      client: selectedClient?.name || "",
      agentId: formData.agentId,
      agent: selectedAgent?.name || "",
      date: formatToMockDate(formData.date),
      time: formData.time,
      status: formData.status as Visit["status"],
    }
    
    setLocalVisits(localVisits.map(v => v.id === updatedVisit.id ? updatedVisit : v))
    setEditingVisit(null)
    setFormData(initialForm)
  }

  const filtered = localVisits.filter((visit) => {
    const term = search.toLowerCase()
    return (
      visit.property.toLowerCase().includes(term) ||
      visit.client.toLowerCase().includes(term) ||
      visit.agent.toLowerCase().includes(term)
    )
  })

  return (
    <>
      <PageHeader
        eyebrow="Coordinación"
        title="Agenda y visitas"
        description="Programa citas y controla la confirmación, realización o cancelación de cada visita."
        actions={<Button icon="plus" onClick={() => { setFormData(initialForm); setIsCreating(true); }}>Programar visita</Button>}
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
            placeholder="Buscar por cliente, agente o propiedad..."
            className="pl-11"
          />
        </div>
      </div>

      <DataTable
        headers={[
          "Fecha",
          "Propiedad",
          "Cliente",
          "Agente",
          "Estado",
          "Acción",
        ]}
        rows={filtered.map((visit) => [
          <div key={`${visit.id}-date`}>
            <p className="font-bold">{visit.date}</p>
            <p className="mt-1 text-xs text-[var(--accent)]">{visit.time}</p>
          </div>,
          visit.property,
          visit.client,
          visit.agent,
          <StatusBadge status={visit.status} key={`${visit.id}-status`} />,
          <Button variant="ghost" className="px-3" onClick={() => openEdit(visit)} key={`${visit.id}-action`}>
            Gestionar
          </Button>,
        ])}
      />

      {(isCreating || editingVisit) && (
        <Modal title={isCreating ? "Programar Nueva Visita" : "Gestionar Visita"} onClose={() => { setIsCreating(false); setEditingVisit(null); }}>
          <form onSubmit={isCreating ? handleCreate : handleEdit} className="flex flex-col gap-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Fecha</label>
                <Input 
                  type="date"
                  required 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Hora</label>
                <Input 
                  type="time"
                  required 
                  value={formData.time} 
                  onChange={e => setFormData({...formData, time: e.target.value})} 
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Propiedad</label>
              <select 
                required
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                value={formData.propertyId}
                onChange={e => setFormData({...formData, propertyId: e.target.value})}
              >
                <option value="" disabled>Seleccione una propiedad</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Cliente</label>
              <select 
                required
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
              >
                <option value="" disabled>Seleccione un cliente</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Agente</label>
              <select 
                required
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                value={formData.agentId}
                onChange={e => setFormData({...formData, agentId: e.target.value})}
              >
                <option value="" disabled>Seleccione un agente</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Estado</label>
              <select 
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Programada">Programada</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Realizada">Realizada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => { setIsCreating(false); setEditingVisit(null); }}>Cancelar</Button>
              <Button type="submit">{isCreating ? "Guardar visita" : "Actualizar visita"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
