import DataTable from "../../components/DataTable"
import { clients } from "../../data/mockData"
import { money } from "../../utils/format"
import { Button, PageHeader, StatusBadge } from "../../components/ui"

export default function AdminClients() {
  return (
    <>
      <PageHeader
        eyebrow="Relaciones"
        title="Clientes"
        description="Información, preferencias y estado comercial de compradores y arrendatarios."
        actions={<Button icon="plus">Añadir cliente</Button>}
      />
      <DataTable
        headers={[
          "Cliente",
          "Contacto",
          "Preferencia",
          "Presupuesto",
          "Estado",
          "Acción",
        ]}
        rows={clients.map((client) => [
          <div>
            <p className="font-bold">{client.name}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {client.id.toUpperCase()}
            </p>
          </div>,
          <div>
            <p>{client.email}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{client.phone}</p>
          </div>,
          client.preference,
          <span className="font-semibold">{money(client.budget)}</span>,
          <StatusBadge status={client.status} />,
          <Button variant="ghost" className="px-3">
            Ver ficha
          </Button>,
        ])}
      />
    </>
  )
}
