import { useState } from "react"
import PropertyCard from "../../components/PropertyCard"
import { properties as initialProperties } from "../../data/mockData"
import type { Property } from "../../types"
import Icon from "../../components/Icon"
import { Button, Input, PageHeader, StatusBadge } from "../../components/ui"
import Modal from "../../components/Modal"
import { money } from "../../utils/format"

export default function AdminProperties() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos los estados")
  const [localProperties, setLocalProperties] = useState(initialProperties)
  
  // Modals state
  const [isCreating, setIsCreating] = useState(false)
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  const initialForm = {
    title: "",
    district: "",
    area: "",
    status: "Disponible",
    bedrooms: "",
    bathrooms: "",
    price: "",
  }
  
  const [formData, setFormData] = useState(initialForm)

  const generateCode = () => {
    const codes = localProperties.map(p => parseInt(p.code.replace('HY-', ''), 10)).filter(n => !isNaN(n))
    const maxCode = codes.length > 0 ? Math.max(...codes) : 1000
    return `HY-${maxCode + 1}`
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const newProperty: Property = {
      id: `p-${Date.now()}`,
      code: generateCode(),
      title: formData.title,
      district: formData.district,
      address: formData.district, // using zone as address for simplicity
      price: parseFloat(formData.price) || 0,
      operation: "Venta", // default
      status: formData.status as Property["status"],
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      area: parseInt(formData.area) || 0,
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=85",
      agentId: "a-01",
      agentName: "Agente Asignado"
    }
    setLocalProperties([newProperty, ...localProperties])
    setIsCreating(false)
    setFormData(initialForm)
  }

  const openEdit = (property: Property) => {
    setViewingProperty(null)
    setFormData({
      title: property.title,
      district: property.district,
      area: property.area.toString(),
      status: property.status,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      price: property.price.toString()
    })
    setEditingProperty(property)
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProperty) return
    
    const updatedProperty: Property = {
      ...editingProperty,
      title: formData.title,
      district: formData.district,
      address: formData.district,
      status: formData.status as Property["status"],
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      area: parseInt(formData.area) || 0,
      price: parseFloat(formData.price) || 0,
    }
    
    setLocalProperties(localProperties.map(p => p.id === updatedProperty.id ? updatedProperty : p))
    setEditingProperty(null)
    setFormData(initialForm)
  }

  const filtered = localProperties.filter((property) => {
    const matchesSearch = `${property.title} ${property.code} ${property.district}`
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesStatus = statusFilter === "Todos los estados" || property.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <PageHeader
        eyebrow="Inventario"
        title="Gestión de propiedades"
        description="Registra, consulta y actualiza el ciclo de vida de cada inmueble."
        actions={<Button icon="plus" onClick={() => { setFormData(initialForm); setIsCreating(true); }}>Nueva propiedad</Button>}
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
            placeholder="Buscar por nombre, código o distrito"
            className="pl-11"
          />
        </div>
        <select 
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>Todos los estados</option>
          <option>Disponible</option>
          <option>Reservada</option>
          <option>Vendida</option>
          <option>Alquilada</option>
        </select>
      </div>
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            mode="admin" 
            onViewDetail={(p) => setViewingProperty(p)} 
          />
        ))}
      </div>

      {(isCreating || editingProperty) && (
        <Modal title={isCreating ? "Nueva Propiedad" : "Editar Propiedad"} onClose={() => { setIsCreating(false); setEditingProperty(null); }}>
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
                <Input value={editingProperty?.code} disabled className="opacity-70 bg-[var(--surface-soft)]" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Nombre de la propiedad</label>
              <Input 
                required 
                placeholder="Ej. Casa en San Carlos"
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Zona</label>
              <Input 
                required 
                placeholder="Ej. Huancayo Centro"
                value={formData.district} 
                onChange={e => setFormData({...formData, district: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Precio</label>
                <Input 
                  type="number" 
                  required 
                  min="0"
                  placeholder="Ej. 150000"
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Estado</label>
                <select 
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Alquilada">Alquilada</option>
                  <option value="Reservada">Reservada</option>
                  <option value="Vendida">Vendida</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Espacio (m²)</label>
                <Input 
                  type="number" 
                  required 
                  min="0"
                  value={formData.area} 
                  onChange={e => setFormData({...formData, area: e.target.value})} 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Cuartos</label>
                <Input 
                  type="number" 
                  required 
                  min="0"
                  value={formData.bedrooms} 
                  onChange={e => setFormData({...formData, bedrooms: e.target.value})} 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Baños</label>
                <Input 
                  type="number" 
                  required 
                  min="0"
                  value={formData.bathrooms} 
                  onChange={e => setFormData({...formData, bathrooms: e.target.value})} 
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => { setIsCreating(false); setEditingProperty(null); }}>Cancelar</Button>
              <Button type="submit">{isCreating ? "Guardar propiedad" : "Guardar cambios"}</Button>
            </div>
          </form>
        </Modal>
      )}

      {viewingProperty && (
        <Modal title="Detalles del inmueble" onClose={() => setViewingProperty(null)}>
          <div className="flex flex-col gap-4">
            <img 
              src={viewingProperty.image} 
              alt={viewingProperty.title} 
              className="h-48 w-full rounded-xl object-cover"
            />
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold">{viewingProperty.title}</h3>
              <StatusBadge status={viewingProperty.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-[var(--surface-soft)] p-4 text-sm">
              <div>
                <p className="text-[var(--muted)]">Código</p>
                <p className="font-semibold">{viewingProperty.code}</p>
              </div>
              <div>
                <p className="text-[var(--muted)]">Operación</p>
                <p className="font-semibold">{viewingProperty.operation}</p>
              </div>
              <div>
                <p className="text-[var(--muted)]">Zona / Distrito</p>
                <p className="font-semibold">{viewingProperty.district}</p>
              </div>
              <div>
                <p className="text-[var(--muted)]">Área</p>
                <p className="font-semibold">{viewingProperty.area} m²</p>
              </div>
              <div>
                <p className="text-[var(--muted)]">Habitaciones</p>
                <p className="font-semibold">{viewingProperty.bedrooms}</p>
              </div>
              <div>
                <p className="text-[var(--muted)]">Baños</p>
                <p className="font-semibold">{viewingProperty.bathrooms}</p>
              </div>
            </div>
            
            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="mb-1 text-sm text-[var(--muted)]">Precio referencial</p>
              <p className="font-display text-2xl font-bold text-[var(--brand)]">
                {money(viewingProperty.price)}
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => openEdit(viewingProperty)}>
                Editar
              </Button>
              <Button onClick={() => setViewingProperty(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
