import { useState, type FormEvent } from "react"
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
  const [open, setOpen] = useState(false)
  const addAgent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const agent: Agent = {
      id: `a-${agents.length + 1}`,
      name: String(data.get("name")),
      email: String(data.get("email")),
      phone: String(data.get("phone")),
      zone: String(data.get("zone")),
      sales: 0,
      volume: 0,
      status: "Activo",
    }
    setAgents((current) => [...current, agent])
    setOpen(false)
  }
  return (
    <>
      <PageHeader
        eyebrow="Equipo comercial"
        title="Agentes inmobiliarios"
        description="Administra accesos, zonas asignadas y desempeño de cada asesor."
        actions={
          <Button icon="plus" onClick={() => setOpen(true)}>
            Añadir agente
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {agents.map((agent) => (
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
              <p>{agent.email}</p>
            </div>
            <Button variant="secondary" className="mt-5 w-full">
              Ver rendimiento
            </Button>
          </Card>
        ))}
      </div>
      {open && (
        <Modal title="Añadir nuevo agente" onClose={() => setOpen(false)}>
          <form onSubmit={addAgent} className="space-y-4">
            <label className="block text-sm font-semibold">
              Nombre completo
              <Input
                name="name"
                required
                className="mt-2"
                placeholder="Ej. Ana Torres"
              />
            </label>
            <label className="block text-sm font-semibold">
              Correo corporativo
              <Input
                name="email"
                type="email"
                required
                className="mt-2"
                placeholder="ana@huancayork.pe"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold">
                Teléfono
                <Input name="phone" required className="mt-2" />
              </label>
              <label className="block text-sm font-semibold">
                Zona
                <Input name="zone" required className="mt-2" />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar agente</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
