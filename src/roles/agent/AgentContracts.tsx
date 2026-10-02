import DataTable from "../../components/DataTable"
import { contracts } from "../../data/mockData"
import { money } from "../../utils/format"
import { PageHeader, StatusBadge } from "../../components/ui"

export default function AgentContracts() {
  const mine = contracts.filter((item) => item.agentId === "a-01")
  return (
    <>
      <PageHeader
        eyebrow="Operaciones vinculadas"
        title="Mis contratos"
        description="Contratos donde figuras como agente responsable."
      />
      <DataTable
        headers={[
          "Contrato",
          "Propiedad",
          "Cliente",
          "Tipo",
          "Importe",
          "Estado",
        ]}
        rows={mine.map((item) => [
          <b>{item.id}</b>,
          item.property,
          item.client,
          item.type,
          <b>{money(item.amount)}</b>,
          <StatusBadge status={item.status} />,
        ])}
      />
    </>
  )
}
