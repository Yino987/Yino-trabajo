import { useState } from "react"
import DataTable from "../../components/DataTable"
import { clients as initialClients } from "../../data/mockData"
import type { Client } from "../../types"
import Icon from "../../components/Icon"
import { Button, Input, PageHeader, StatusBadge } from "../../components/ui"
import Modal from "../../components/Modal"
import { money } from "../../utils/format"

export default function AdminClients() {
  const [localClients, setLocalClients] = useState(initialClients)
  const [search, setSearch] = useState("")
  
  // Modals state
  const [isCreating, setIsCreating] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const initialForm = {
    name: "",
    email: "",
    phone: "",
    preference: "",
    budget: "",
    status: "Nuevo",
  }
  
  const [formData, setFormData] = useState(initialForm)

  const generateCode = () => {
    const codes = localClients.map(c => parseInt(c.code.replace('CLI-', ''), 10)).filter(n => !isNaN(n))
    const maxCode = codes.length > 0 ? Math.max(...codes) : 1000
    return `CLI-${maxCode + 1}`
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const newClient: Client = {
      id: `c-${Date.now()}`,
      code: generateCode(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      preference: formData.preference,
      budget: parseFloat(formData.budget) || 0,
      status: formData.status as Client["status"],
    }
    setLocalClients([newClient, ...localClients])
    setIsCreating(false)
    setFormData(initialForm)
  }

  const openEdit = (client: Client) => {
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      preference: client.preference,
      budget: client.budget.toString(),
      status: client.status,
    })
    setEditingClient(client)
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClient) return
    
    const updatedClient: Client = {
      ...editingClient,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      preference: formData.preference,
      budget: parseFloat(formData.budget) || 0,
      status: formData.status as Client["status"],
    }
    
    setLocalClients(localClients.map(c => c.id === updatedClient.id ? updatedClient : c))
    setEditingClient(null)
    setFormData(initialForm)
  }

  const filtered = localClients.filter((client) =>
    `${client.name} ${client.code}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <PageHeader
        eyebrow="Relaciones"
        title="Clientes"
        description="Información, preferencias y estado comercial de compradores y arrendatarios."
        actions={<Button icon="plus" onClick={() => { setFormData(initialForm); setIsCreating(true); }}>Añadir cliente</Button>}
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
            placeholder="Buscar cliente por nombre o código"
            className="pl-11"
          />
        </div>
      </div>

      <DataTable
        headers={[
          "Cliente",
          "Contacto",
          "Preferencia",
          "Presupuesto",
          "Estado",
          "Acción",
        ]}
        rows={filtered.map((client) => [
          <div key={`${client.id}-name`}>
            <p className="font-bold">{client.name}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {client.code}
            </p>
          </div>,
          <div key={`${client.id}-contact`}>
            <p>{client.email}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{client.phone}</p>
          </div>,
          client.preference,
          <span className="font-semibold" key={`${client.id}-budget`}>{money(client.budget)}</span>,
          <StatusBadge status={client.status} key={`${client.id}-status`} />,
          <Button variant="ghost" className="px-3" onClick={() => openEdit(client)} key={`${client.id}-action`}>
            Ver ficha
          </Button>,
        ])}
      />

      {(isCreating || editingClient) && (
        <Modal title={isCreating ? "Añadir Cliente" : "Ficha de Cliente"} onClose={() => { setIsCreating(false); setEditingClient(null); }}>
          <form onSubmit={isCreating ? handleCreate : handleEdit} className="flex flex-col gap-4">
            {isCreating && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Código (Autogenerado)</label>
                <Input value={generateCode()} disabled className="opacity-70 bg-[var(--surface-soft)]" />
              </div>
            )}
            {!isCreating && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Código</label>
                <Input value={editingClient?.code} disabled className="opacity-70 bg-[var(--surface-soft)]" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Nombres y apellidos</label>
              <Input 
                required 
                placeholder="Ej. Juan Pérez"
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Email</label>
                <Input 
                  type="email" 
                  required 
                  placeholder="ejemplo@correo.com"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Teléfono</label>
                <Input 
                  required 
                  placeholder="Ej. 987654321"
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Preferencia</label>
              <Input 
                required 
                placeholder="Ej. Casa de 3 dormitorios en el centro"
                value={formData.preference} 
                onChange={e => setFormData({...formData, preference: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Presupuesto</label>
                <Input 
                  type="number" 
                  required 
                  min="0"
                  placeholder="Ej. 150000"
                  value={formData.budget} 
                  onChange={e => setFormData({...formData, budget: e.target.value})} 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Estado</label>
                <select 
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="En seguimiento">En seguimiento</option>
                  <option value="Cliente">Cliente</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => { setIsCreating(false); setEditingClient(null); }}>Cancelar</Button>
              <Button type="submit">{isCreating ? "Guardar cliente" : "Actualizar cliente"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
