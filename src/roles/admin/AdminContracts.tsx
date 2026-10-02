import DataTable from "../../components/DataTable"
import { contracts } from "../../data/mockData"
import { money } from "../../utils/format"
import { Button, PageHeader, StatusBadge } from "../../components/ui"

export default function AdminContracts() {
  return (
    <>
      <PageHeader
        eyebrow="Operaciones"
        title="Contratos y transacciones"
        description="Acuerdos de venta y alquiler vinculados a clientes, inmuebles y agentes."
        actions={<Button icon="plus">Nuevo contrato</Button>}
      />
      <DataTable
        headers={[
          "Contrato",
          "Inmueble / Cliente",
          "Tipo",
          "Agente",
          "Importe",
          "Estado",
        ]}
        rows={contracts.map((contract) => [
          <div>
            <p className="font-bold">{contract.id}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{contract.date}</p>
          </div>,
          <div>
            <p>{contract.property}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {contract.client}
            </p>
          </div>,
          contract.type,
          contract.agent,
          <span className="font-bold">{money(contract.amount)}</span>,
          <StatusBadge status={contract.status} />,
        ])}
      />
    </>
  )
}
