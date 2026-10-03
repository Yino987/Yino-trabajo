import { useState } from "react"
import DataTable from "../../components/DataTable"
import { contracts as initialContracts, properties, clients, agents } from "../../data/mockData"
import type { Contract } from "../../types"
import { money } from "../../utils/format"
import { Button, Input, PageHeader, StatusBadge } from "../../components/ui"
import Modal from "../../components/Modal"
import Icon from "../../components/Icon"

export default function AdminContracts() {
  const [localContracts, setLocalContracts] = useState(initialContracts)
  const [search, setSearch] = useState("")
  
  const [isCreating, setIsCreating] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)

  const initialForm = {
    propertyId: properties[0]?.id || "",
    clientId: clients[0]?.id || "",
    agentId: agents[0]?.id || "",
    type: properties[0]?.operation || "Venta",
    amount: properties[0]?.price?.toString() || "0",
    status: "Activo",
  }
  
  const [formData, setFormData] = useState(initialForm)

  const generateCode = () => {
    const codes = localContracts.map(c => parseInt(c.id.split('-').pop() || '0', 10)).filter(n => !isNaN(n))
    const maxCode = codes.length > 0 ? Math.max(...codes) : 18
    return `CT-2026-${String(maxCode + 1).padStart(3, '0')}`
  }

  const handlePropertyChange = (propId: string) => {
    const selectedProp = properties.find(p => p.id === propId)
    setFormData({
      ...formData,
      propertyId: propId,
      type: selectedProp?.operation || "Venta",
      amount: selectedProp?.price?.toString() || "0"
    })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedProp = properties.find(p => p.id === formData.propertyId)
    const selectedClient = clients.find(c => c.id === formData.clientId)
    const selectedAgent = agents.find(a => a.id === formData.agentId)

    const newContract: Contract = {
      id: generateCode(),
      property: selectedProp?.title || "",
      clientId: formData.clientId,
      client: selectedClient?.name || "",
      agentId: formData.agentId,
      agent: selectedAgent?.name || "",
      type: formData.type as Contract["type"],
      amount: parseFloat(formData.amount) || 0,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', ''),
      status: formData.status as Contract["status"],
    }
    setLocalContracts([newContract, ...localContracts])
    setIsCreating(false)
    setFormData(initialForm)
  }

  const openEdit = (contract: Contract) => {
    const propId = properties.find(p => p.title === contract.property)?.id || properties[0]?.id
    setFormData({
      propertyId: propId,
      clientId: contract.clientId,
      agentId: contract.agentId,
      type: contract.type,
      amount: contract.amount.toString(),
      status: contract.status,
    })
    setEditingContract(contract)
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContract) return
    
    const selectedProp = properties.find(p => p.id === formData.propertyId)
    const selectedClient = clients.find(c => c.id === formData.clientId)
    const selectedAgent = agents.find(a => a.id === formData.agentId)

    const updatedContract: Contract = {
      ...editingContract,
      property: selectedProp?.title || "",
      clientId: formData.clientId,
      client: selectedClient?.name || "",
      agentId: formData.agentId,
      agent: selectedAgent?.name || "",
      type: formData.type as Contract["type"],
      amount: parseFloat(formData.amount) || 0,
      status: formData.status as Contract["status"],
    }
    
    setLocalContracts(localContracts.map(c => c.id === updatedContract.id ? updatedContract : c))
    setEditingContract(null)
    setFormData(initialForm)
  }

  const filtered = localContracts.filter((contract) => {
    const term = search.toLowerCase()
    return (
      contract.id.toLowerCase().includes(term) ||
      contract.property.toLowerCase().includes(term)
    )
  })

  return (
    <>
      <PageHeader
        eyebrow="Operaciones"
        title="Contratos y transacciones"
        description="Acuerdos de venta y alquiler vinculados a clientes, inmuebles y agentes."
        actions={<Button icon="plus" onClick={() => { setFormData(initialForm); setIsCreating(true); }}>Nuevo contrato</Button>}
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
            placeholder="Buscar por código de contrato o nombre de propiedad..."
            className="pl-11"
          />
        </div>
      </div>

      <DataTable
        headers={[
          "Contrato",
          "Inmueble / Cliente",
          "Tipo",
          "Agente",
          "Importe",
          "Estado",
          "Acción"
        ]}
        rows={filtered.map((contract) => [
          <div key={`${contract.id}-contract`}>
            <p className="font-bold">{contract.id}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{contract.date}</p>
          </div>,
          <div key={`${contract.id}-details`}>
            <p>{contract.property}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {contract.client}
            </p>
          </div>,
          contract.type,
          contract.agent,
          <span className="font-bold" key={`${contract.id}-amount`}>{money(contract.amount)}</span>,
          <StatusBadge status={contract.status} key={`${contract.id}-status`} />,
          <Button variant="ghost" className="px-3" onClick={() => openEdit(contract)} key={`${contract.id}-action`}>
            Gestionar
          </Button>
        ])}
      />

      {(isCreating || editingContract) && (
        <Modal title={isCreating ? "Nuevo Contrato" : "Gestionar Contrato"} onClose={() => { setIsCreating(false); setEditingContract(null); }}>
          <form onSubmit={isCreating ? handleCreate : handleEdit} className="flex flex-col gap-4">
            
            {isCreating && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Código del Contrato (Autogenerado)</label>
                <Input value={generateCode()} disabled className="opacity-70 bg-[var(--surface-soft)]" />
              </div>
            )}
            {!isCreating && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Código del Contrato</label>
                <Input value={editingContract?.id} disabled className="opacity-70 bg-[var(--surface-soft)]" />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Propiedad Involucrada</label>
              <select 
                required
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                value={formData.propertyId}
                onChange={e => handlePropertyChange(e.target.value)}
              >
                <option value="" disabled>Seleccione una propiedad</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.title} ({p.operation})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Cliente Comprador/Arrendatario</label>
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
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Agente Responsable</label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Tipo de Operación</label>
                <select 
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="Venta">Venta</option>
                  <option value="Alquiler">Alquiler</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Importe S/.</label>
                <Input 
                  type="number" 
                  required 
                  min="0"
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: e.target.value})} 
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Estado</label>
              <select 
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Completado">Completado</option>
                <option value="Activo">Activo</option>
                <option value="Vencido">Vencido</option>
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => { setIsCreating(false); setEditingContract(null); }}>Cancelar</Button>
              <Button type="submit">{isCreating ? "Registrar contrato" : "Guardar cambios"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
