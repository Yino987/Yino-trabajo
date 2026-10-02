import DataTable from "../../components/DataTable"
import { contracts } from "../../data/mockData"
import { money } from "../../utils/format"
import { Button, PageHeader, StatusBadge } from "../../components/ui"

export default function ClientContracts() {
  const mine = contracts.filter((item) => item.clientId === "c-01")
  return (
    <>
      <PageHeader
        eyebrow="Documentos"
        title="Mis contratos"
        description="Información contractual vinculada a tu cuenta."
      />
      <DataTable
        headers={[
          "Contrato",
          "Propiedad",
          "Tipo",
          "Fecha",
          "Importe",
          "Estado",
          "Documento",
        ]}
        rows={mine.map((item) => [
          <b>{item.id}</b>,
          item.property,
          item.type,
          item.date,
          <b>{money(item.amount)}</b>,
          <StatusBadge status={item.status} />,
          <Button variant="secondary" icon="download">
            Descargar
          </Button>,
        ])}
      />
    </>
  )
}
