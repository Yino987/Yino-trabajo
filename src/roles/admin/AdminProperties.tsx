import { useEffect, useState } from "react"

import PropertyCard from "../../components/PropertyCard"

import PropertyComments from "../../components/PropertyComments"

import type { Property } from "../../types"

import {
  getAdminProperties,
  getPropertyOptions,
  saveAdminRecord,
  type PropertyOptions,
} from "../../utils/databaseApi"

import { mapDatabaseProperty } from "../../utils/propertyMapper"

import Icon from "../../components/Icon"

import { Button, Input, PageHeader, StatusBadge } from "../../components/ui"

import Modal from "../../components/Modal"

import { money } from "../../utils/format"

export default function AdminProperties({
  adminToken,
}: {
  adminToken: string
}) {
  const [search, setSearch] = useState("")

  const [statusFilter, setStatusFilter] = useState("Todos los estados")

  const [localProperties, setLocalProperties] = useState<Property[]>([])

  const [isLoadingProperties, setIsLoadingProperties] = useState(true)

  const [loadError, setLoadError] = useState("")
  const [options, setOptions] = useState<PropertyOptions | null>(null)

  // Modals state

  const [isCreating, setIsCreating] = useState(false)

  const [viewingProperty, setViewingProperty] = useState<Property | null>(null)
  const [detailAnchor, setDetailAnchor] = useState<{
    left: number
    top: number
  } | null>(null)

  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  const initialForm = {
    title: "",

    district: "",

    area: "",

    status: "Disponible",

    bedrooms: "",

    bathrooms: "",

    price: "",
    typeId: "",
    agentId: "",
    zoneId: "",
  }

  const [formData, setFormData] = useState(initialForm)

  const openDetails = (property: Property, trigger: HTMLButtonElement) => {
    const card = trigger.closest("article") ?? trigger
    const rect = card.getBoundingClientRect()
    const halfPanelWidth = Math.min(272, (window.innerWidth - 32) / 2)
    setDetailAnchor({
      left: Math.max(
        halfPanelWidth + 16,
        Math.min(
          window.innerWidth - halfPanelWidth - 16,
          rect.left + rect.width / 2,
        ),
      ),
      top: Math.max(
        window.innerHeight * 0.4,
        Math.min(window.innerHeight * 0.6, rect.top + rect.height / 2),
      ),
    })
    setViewingProperty(property)
  }

  useEffect(() => {
    let active = true

    setIsLoadingProperties(true)

    Promise.all([
      getAdminProperties(adminToken),
      getPropertyOptions(adminToken),
    ])
      .then(([rows, propertyOptions]) => {
        if (active) {
          setLocalProperties(rows.map(mapDatabaseProperty))
          setOptions(propertyOptions)
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setLoadError(
            cause instanceof Error
              ? cause.message
              : "No se pudieron cargar las propiedades de MySQL.",
          )
        }
      })

      .finally(() => {
        if (active) setIsLoadingProperties(false)
      })

    return () => {
      active = false
    }
  }, [adminToken])

  const generateCode = () => {
    const codes = localProperties
      .map((p) => parseInt(p.code.replace("HY-", ""), 10))
      .filter((n) => !isNaN(n))

    const maxCode = codes.length > 0 ? Math.max(...codes) : 1000

    return `HY-${maxCode + 1}`
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadError("")
    try {
      await saveAdminRecord(adminToken, "properties", null, {
        address: formData.title,
        district: formData.district,
        area: Number(formData.area),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        price: Number(formData.price),
        status: formData.status,
        typeId: Number(formData.typeId) || null,
        agentId: Number(formData.agentId) || null,
        zoneId: Number(formData.zoneId) || null,
      })
      const rows = await getAdminProperties(adminToken)
      setLocalProperties(rows.map(mapDatabaseProperty))
      setIsCreating(false)
      setFormData(initialForm)
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : "No se pudo guardar el inmueble.")
    }
  }

  const openEdit = (property: Property) => {
    setViewingProperty(null)

    setFormData({
      title: property.address,

      district: property.district,

      area: property.area.toString(),

      status: property.status,

      bedrooms: property.bedrooms.toString(),

      bathrooms: property.bathrooms.toString(),

      price: property.price.toString(),
      typeId: property.typeId ?? "",
      agentId: property.agentId,
      zoneId: property.zoneId ?? "",
    })

    setEditingProperty(property)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingProperty) return

    setLoadError("")
    try {
      await saveAdminRecord(adminToken, "properties", Number(editingProperty.id), {
        address: formData.title,
        district: formData.district,
        area: Number(formData.area),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        price: Number(formData.price),
        status: formData.status,
        typeId: Number(formData.typeId) || null,
        agentId: Number(formData.agentId) || null,
        zoneId: Number(formData.zoneId) || null,
      })
      const rows = await getAdminProperties(adminToken)
      setLocalProperties(rows.map(mapDatabaseProperty))
      setEditingProperty(null)
      setFormData(initialForm)
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : "No se pudo actualizar el inmueble.")
    }
  }

  const filtered = localProperties.filter((property) => {
    const matchesSearch =
      `${property.title} ${property.code} ${property.district}`

        .toLowerCase()

        .includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === "Todos los estados" || property.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <>
      <PageHeader
        eyebrow="Inventario"
        title="Gestión de propiedades"
        description="Registra, consulta y actualiza el ciclo de vida de cada inmueble."
        actions={
          <Button
            icon="plus"
            onClick={() => {
              setFormData(initialForm)
              setIsCreating(true)
            }}
          >
            Nueva propiedad
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
      {loadError && (
        <p
          role="alert"
          className="mb-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          {loadError}
        </p>
      )}
      {isLoadingProperties ? (
        <p className="py-10 text-center text-sm text-[var(--muted)]">
          Cargando propiedades de Inmobiliaria…
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              mode="admin"
              onViewDetail={openDetails}
            />
          ))}
        </div>
      )}

      {(isCreating || editingProperty) && (
        <Modal
          title={isCreating ? "Nueva Propiedad" : "Editar Propiedad"}
          onClose={() => {
            setIsCreating(false)
            setEditingProperty(null)
          }}
        >
          <form
            onSubmit={isCreating ? handleCreate : handleEdit}
            className="flex flex-col gap-4"
          >
            {isCreating && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                  Código (Autogenerado)
                </label>
                <Input
                  value={generateCode()}
                  disabled
                  className="opacity-70 bg-[var(--surface-soft)]"
                />
              </div>
            )}
            {!isCreating && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                  Código
                </label>
                <Input
                  value={editingProperty?.code}
                  disabled
                  className="opacity-70 bg-[var(--surface-soft)]"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                Dirección del inmueble
              </label>
              <Input
                required
                placeholder="Dirección registrada en Inmobiliaria"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                Ciudad
              </label>
              <Input
                required
                placeholder="Ej. Huancayo Centro"
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                  Precio
                </label>
                <Input
                  type="number"
                  required
                  min="0"
                  placeholder="Ej. 150000"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                  Estado
                </label>
                <select
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Alquilada">Alquilada</option>
                  <option value="Reservada">Reservada</option>
                  <option value="Vendida">Vendida</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-semibold text-[var(--text)]">
                Tipo de inmueble
                <select
                  required
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                  value={formData.typeId}
                  onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                >
                  <option value="">Selecciona un tipo</option>
                  {options?.types.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                Zona
                <select
                  required
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                  value={formData.zoneId}
                  onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                >
                  <option value="">Selecciona una zona</option>
                  {options?.zones.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
            </div>
            <label className="block text-sm font-semibold text-[var(--text)]">
              Asesor asignado
              <select
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
                value={formData.agentId}
                onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
              >
                <option value="">Sin asignar</option>
                {options?.agents.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                  Espacio (m²)
                </label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                  Cuartos
                </label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    setFormData({ ...formData, bedrooms: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                  Baños
                </label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    setFormData({ ...formData, bathrooms: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsCreating(false)
                  setEditingProperty(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {isCreating ? "Guardar propiedad" : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {viewingProperty && (
        <Modal
          title="Resumen y detalles del inmueble"
          onClose={() => setViewingProperty(null)}
          anchor={detailAnchor}
        >
          <div className="flex flex-col gap-4">
            <img
              src={viewingProperty.image}
              alt={viewingProperty.title}
              className="h-48 w-full rounded-xl object-cover"
            />
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold">
                {viewingProperty.title}
              </h3>
              <StatusBadge status={viewingProperty.status} />
            </div>
            <p className="text-sm leading-6 text-[var(--muted)]">
              {viewingProperty.title} es un inmueble de tipo{" "}
              <b className="text-[var(--text)]">{viewingProperty.operation}</b>{" "}
              ubicado en{" "}
              <b className="text-[var(--text)]">{viewingProperty.address}</b>.
              Cuenta con {viewingProperty.area} m², {viewingProperty.bedrooms}{" "}
              habitaciones y {viewingProperty.bathrooms} baños.
            </p>

            <div className="grid grid-cols-2 gap-4 rounded-xl bg-[var(--surface-soft)] p-4 text-sm">
              <div>
                <p className="text-[var(--muted)]">Código</p>
                <p className="font-semibold">{viewingProperty.code}</p>
              </div>
              <div>
                <p className="text-[var(--muted)]">Tipo de inmueble</p>
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
              <p className="mb-1 text-sm text-[var(--muted)]">
                Precio referencial
              </p>
              <p className="font-display text-2xl font-bold text-[var(--brand)]">
                {money(viewingProperty.price)}
              </p>
            </div>

            <PropertyComments
              propertyId={viewingProperty.id}
              mode="admin"
              adminToken={adminToken}
            />

            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => openEdit(viewingProperty)}
              >
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
