import { useEffect, useMemo, useState, type FormEvent } from "react"

import DataTable from "../../components/DataTable"
import Icon from "../../components/Icon"
import Modal from "../../components/Modal"
import { Button, Input, PageHeader } from "../../components/ui"
import type { DatabaseClient } from "../../utils/databaseApi"
import { getAdminClients, saveAccount, saveAdminRecord } from "../../utils/databaseApi"

type ClientForm = {
  firstName: string
  lastName: string
  dni: string
  phone: string
  email: string
  address: string
  password: string
}

const emptyForm: ClientForm = {
  firstName: "",
  lastName: "",
  dni: "",
  phone: "",
  email: "",
  address: "",
  password: "",
}

export default function AdminClients({ adminToken }: { adminToken: string }) {
  const [clients, setClients] = useState<DatabaseClient[]>([])
  const [search, setSearch] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<DatabaseClient | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const loadClients = async () => {
    setIsLoading(true)
    try {
      setClients(await getAdminClients(adminToken))
      setError("")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar los clientes.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadClients()
  }, [adminToken])

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    return clients.filter((client) =>
      `${client.first_name} ${client.last_name} ${client.dni} ${client.email ?? ""}`
        .toLocaleLowerCase()
        .includes(term),
    )
  }, [clients, search])

  const openEdit = (client: DatabaseClient) => {
    setEditing(client)
    setForm({
      firstName: client.first_name,
      lastName: client.last_name,
      dni: client.dni,
      phone: client.phone ?? "",
      email: client.email ?? "",
      address: client.address ?? "",
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
        "clients",
        editing?.id ?? null,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          dni: form.dni,
          phone: form.phone,
          email: form.email,
          address: form.address,
        },
      )
      const clientId = editing?.id ?? result?.id
      if (!editing && clientId) {
        setEditing({
          id: clientId,
          first_name: form.firstName,
          last_name: form.lastName,
          dni: form.dni,
          phone: form.phone || null,
          email: form.email || null,
          address: form.address || null,
        })
        setIsCreating(false)
      }
      if (form.password && clientId) {
        await saveAccount(adminToken, "cliente", clientId, form.password)
      }
      setIsCreating(false)
      setEditing(null)
      setForm(emptyForm)
      await loadClients()
    } catch (cause) {
      await loadClients()
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el cliente.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Relaciones"
        title="Clientes"
        description="Registros de clientes leídos y guardados directamente en Inmobiliaria."
        actions={
          <Button
            icon="plus"
            onClick={() => {
              setForm(emptyForm)
              setEditing(null)
              setIsCreating(true)
              setError("")
            }}
          >
            Añadir cliente
          </Button>
        }
      />
      {error && (
        <p role="alert" className="mb-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}
      <div className="mb-6 relative">
        <Icon name="search" size={18} className="absolute left-4 top-3 text-[var(--muted)]" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar cliente por nombre, DNI o correo"
          className="pl-11"
        />
      </div>
      {isLoading ? (
        <p className="py-10 text-center text-sm text-[var(--muted)]">Cargando clientes de Inmobiliaria…</p>
      ) : (
        <DataTable
          headers={["Cliente", "DNI", "Contacto", "Dirección", "Acción"]}
          rows={filtered.map((client) => [
            <div key={`${client.id}-name`}>
              <p className="font-bold">{client.first_name} {client.last_name}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">ID {client.id}</p>
            </div>,
            client.dni,
            <div key={`${client.id}-contact`}>
              <p>{client.email || "Sin correo"}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{client.phone || "Sin teléfono"}</p>
            </div>,
            client.address || "Sin dirección",
            <Button key={`${client.id}-edit`} variant="secondary" onClick={() => openEdit(client)}>
              Editar / acceso
            </Button>,
          ])}
        />
      )}
      {(isCreating || editing) && (
        <Modal
          title={isCreating ? "Añadir cliente" : "Editar cliente y acceso"}
          onClose={() => {
            if (!isSaving) {
              setIsCreating(false)
              setEditing(null)
              setError("")
            }
          }}
        >
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold">Nombres
                <Input required maxLength={20} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-2" />
              </label>
              <label className="text-sm font-semibold">Apellidos
                <Input required maxLength={20} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-2" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold">DNI
                <Input required minLength={8} maxLength={8} inputMode="numeric" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value.replace(/\D/g, "") })} className="mt-2" />
              </label>
              <label className="text-sm font-semibold">Teléfono
                <Input maxLength={9} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2" />
              </label>
            </div>
            <label className="block text-sm font-semibold">Correo
              <Input type="email" maxLength={30} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2" />
            </label>
            <label className="block text-sm font-semibold">Dirección
              <Input maxLength={100} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-2" />
            </label>
            <label className="block text-sm font-semibold">Contraseña de acceso (opcional)
              <Input type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-2" placeholder="Mínimo 8 caracteres" />
              <span className="mt-1 block text-xs font-normal text-[var(--muted)]">Al definirla, el cliente podrá acceder con su correo y el perfil Cliente.</span>
            </label>
            {error && <p role="alert" className="rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" disabled={isSaving} onClick={() => { setIsCreating(false); setEditing(null); }}>Cancelar</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? "Guardando…" : "Guardar en Inmobiliaria"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
