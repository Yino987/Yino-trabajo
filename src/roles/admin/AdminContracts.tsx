import { useEffect, useMemo, useState, type FormEvent } from "react"

import DataTable from "../../components/DataTable"
import Icon from "../../components/Icon"
import Modal from "../../components/Modal"
import { Button, Input, PageHeader } from "../../components/ui"
import { money } from "../../utils/format"
import {
  getAdminContracts,
  getPropertyOptions,
  saveAdminRecord,
  type DatabaseContract,
  type PropertyOptions,
} from "../../utils/databaseApi"
import {
  exportContractPdf,
  exportContractWord,
  getContractSections,
} from "../../utils/exportContract"

type ContractForm = {
  propertyId: string
  clientId: string
  agentId: string
  type: "venta" | "alquiler"
  amount: string
  startDate: string
  endDate: string
}

const emptyForm: ContractForm = {
  propertyId: "",
  clientId: "",
  agentId: "",
  type: "venta",
  amount: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
}

export default function AdminContracts({ adminToken }: { adminToken: string }) {
  const [contracts, setContracts] = useState<DatabaseContract[]>([])
  const [options, setOptions] = useState<PropertyOptions | null>(null)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [viewing, setViewing] = useState<DatabaseContract | null>(null)
  const [showPhysicalContract, setShowPhysicalContract] = useState(false)
  const [showPrintOptions, setShowPrintOptions] = useState(false)
  const [exportingContract, setExportingContract] = useState<
    "pdf" | "word" | null
  >(null)
  const [documentError, setDocumentError] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const load = async () => {
    setIsLoading(true)
    try {
      const [contractRows, references] = await Promise.all([
        getAdminContracts(adminToken),
        getPropertyOptions(adminToken),
      ])
      setContracts(contractRows)
      setOptions(references)
      setError("")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar los contratos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void load() }, [adminToken])

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    return contracts.filter((contract) =>
      `${contract.id} ${contract.property} ${contract.client} ${contract.agent} ${contract.type}`
        .toLocaleLowerCase().includes(term),
    )
  }, [contracts, search])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError("")
    try {
      await saveAdminRecord(adminToken, "contracts", null, {
        propertyId: Number(form.propertyId),
        clientId: Number(form.clientId),
        agentId: Number(form.agentId),
        type: form.type,
        amount: Number(form.amount),
        startDate: form.startDate,
        endDate: form.endDate || null,
      })
      setIsCreating(false)
      setForm(emptyForm)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo registrar el contrato.")
    } finally {
      setIsSaving(false)
    }
  }

  const selectClass = "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
  const physicalContract = viewing ? getContractSections(viewing) : null

  const downloadContract = async (format: "pdf" | "word") => {
    if (!viewing) return
    setExportingContract(format)
    setDocumentError("")
    try {
      if (format === "pdf") await exportContractPdf(viewing)
      else await exportContractWord(viewing)
      setShowPrintOptions(false)
    } catch (cause) {
      setDocumentError(
        cause instanceof Error
          ? cause.message
          : "No se pudo preparar el archivo del contrato.",
      )
    } finally {
      setExportingContract(null)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Operaciones"
        title="Contratos y transacciones"
        description="Contratos reales asociados a clientes, inmuebles y asesores. Registrar una venta o alquiler actualiza el estado y su historial."
        actions={<Button icon="plus" onClick={() => { setForm(emptyForm); setIsCreating(true); setError("") }}>Nuevo contrato</Button>}
      />
      {error && <p role="alert" className="mb-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}
      <div className="relative mb-6">
        <Icon name="search" size={18} className="absolute left-4 top-3 text-[var(--muted)]" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por número, inmueble, cliente o asesor" className="pl-11" />
      </div>
      {isLoading ? <p className="py-10 text-center text-sm text-[var(--muted)]">Cargando contratos…</p> : (
        <DataTable
          headers={["Contrato", "Inmueble / cliente", "Tipo", "Asesor", "Importe", "Acción"]}
          rows={filtered.map((contract) => [
            <div key={`${contract.id}-id`}><b>Contrato #{contract.id}</b><p className="mt-1 text-xs text-[var(--muted)]">{String(contract.start_date).slice(0, 10)}</p></div>,
            <div key={`${contract.id}-parties`}><p>{contract.property}</p><p className="mt-1 text-xs text-[var(--muted)]">{contract.client}</p></div>,
            contract.type === "venta" ? "Venta" : "Alquiler",
            contract.agent,
            <b key={`${contract.id}-amount`}>{money(Number(contract.amount))}</b>,
            <Button key={`${contract.id}-detail`} variant="secondary" onClick={() => setViewing(contract)}>Ver detalle</Button>,
          ])}
        />
      )}
      {isCreating && (
        <Modal title="Registrar contrato" onClose={() => { if (!isSaving) setIsCreating(false) }}>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold">Inmueble (solo puede contratarse si está disponible)
              <select required className={selectClass} value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })}>
                <option value="">Selecciona un inmueble</option>
                {options?.availableProperties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold">Cliente
                <select required className={selectClass} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                  <option value="">Selecciona un cliente</option>
                  {options?.clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold">Asesor
                <select required className={selectClass} value={form.agentId} onChange={(e) => setForm({ ...form, agentId: e.target.value })}>
                  <option value="">Selecciona un asesor</option>
                  {options?.agents.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
            </div>
            <label className="block text-sm font-semibold">Tipo de contrato
              <select className={selectClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ContractForm["type"] })}>
                <option value="venta">Venta</option><option value="alquiler">Alquiler</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold">Importe<Input type="number" min="0.01" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-2" /></label>
              <label className="text-sm font-semibold">Inicio<Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-2" /></label>
            </div>
            {form.type === "alquiler" && <label className="block text-sm font-semibold">Fin del contrato (opcional)<Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="mt-2" /></label>}
            <p className="text-xs leading-5 text-[var(--muted)]">La operación y el cambio de estado del inmueble quedan registrados juntos en una transacción de base de datos.</p>
            <div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={isSaving} onClick={() => setIsCreating(false)}>Cancelar</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Guardando…" : "Registrar en Inmobiliaria"}</Button></div>
          </form>
        </Modal>
      )}
      {viewing && (
        showPhysicalContract && physicalContract ? (
          <Modal
            title={`Contrato en físico · #${viewing.id}`}
            size="wide"
            onClose={() => {
              setShowPhysicalContract(false)
              setShowPrintOptions(false)
              setDocumentError("")
            }}
          >
            <article className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-6 text-slate-800 shadow-sm sm:p-10">
              <header className="border-b-2 border-emerald-900 pb-5 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-900">
                  Huancayork · Gestión inmobiliaria
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold text-emerald-950 sm:text-3xl">
                  {physicalContract.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Contrato N.º {viewing.id} · Borrador para revisión
                </p>
              </header>

              <p className="mt-6 text-sm leading-7">
                Comparecen, de una parte, <strong>{viewing.client}</strong>,
                cuyos demás datos de identidad y domicilio quedan pendientes de
                completar; y de otra parte, la persona propietaria o arrendadora
                del inmueble, cuyos datos deberán incorporarse y verificarse.
                Ambas partes manifiestan que suscriben el presente documento
                bajo las cláusulas siguientes.
              </p>

              {[
                { title: "Datos de las partes", items: physicalContract.parties },
                {
                  title: "Datos de la operación",
                  items: physicalContract.property,
                },
              ].map((section) => (
                <section key={section.title} className="mt-7">
                  <h3 className="border-b border-slate-300 pb-2 text-sm font-bold uppercase tracking-wide text-emerald-900">
                    {section.title}
                  </h3>
                  <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    {section.items.map((item, index) => (
                      <div key={`${item.label}-${index}`}>
                        <dt className="text-xs font-semibold uppercase text-slate-500">
                          {item.label}
                        </dt>
                        <dd className="mt-1 border-b border-dotted border-slate-300 pb-1 text-sm">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}

              <section className="mt-7">
                <h3 className="border-b border-slate-300 pb-2 text-sm font-bold uppercase tracking-wide text-emerald-900">
                  Cláusulas
                </h3>
                <div className="mt-4 space-y-4">
                  {physicalContract.clauses.map((clause) => (
                    <div key={clause.title}>
                      <h4 className="text-sm font-bold">{clause.title}</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {clause.text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-10">
                <h3 className="border-b border-slate-300 pb-2 text-sm font-bold uppercase tracking-wide text-emerald-900">
                  Firmas
                </h3>
                <div className="mt-12 grid gap-10 text-center text-xs sm:grid-cols-2">
                  <div className="border-t border-slate-500 pt-2">
                    Parte compradora / arrendataria
                    <p className="mt-1">Nombre y documento: __________________</p>
                  </div>
                  <div className="border-t border-slate-500 pt-2">
                    Parte vendedora / arrendadora
                    <p className="mt-1">Nombre y documento: __________________</p>
                  </div>
                </div>
                <div className="mx-auto mt-12 max-w-xs border-t border-slate-500 pt-2 text-center text-xs">
                  Asesor registrado: {viewing.agent}
                </div>
              </section>

              <p className="mt-8 border-l-4 border-amber-500 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
                <strong>IMPORTANTE — BORRADOR PARA REVISIÓN:</strong>{" "}
                {physicalContract.notices}
              </p>
            </article>

            {documentError && (
              <p role="alert" className="mt-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
                {documentError}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPhysicalContract(false)
                  setShowPrintOptions(false)
                  setDocumentError("")
                }}
              >
                Volver al detalle
              </Button>
              <div className="flex flex-wrap justify-end gap-2">
                {showPrintOptions && (
                  <>
                    <Button
                      variant="secondary"
                      disabled={exportingContract !== null}
                      onClick={() => void downloadContract("word")}
                    >
                      {exportingContract === "word"
                        ? "Preparando Word…"
                        : "Imprimir en Word"}
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={exportingContract !== null}
                      onClick={() => void downloadContract("pdf")}
                    >
                      {exportingContract === "pdf"
                        ? "Preparando PDF…"
                        : "Imprimir en PDF"}
                    </Button>
                  </>
                )}
                <Button
                  icon="download"
                  disabled={exportingContract !== null}
                  onClick={() => setShowPrintOptions((current) => !current)}
                >
                  Imprimir
                </Button>
              </div>
            </div>
          </Modal>
        ) : (
          <Modal title={`Contrato #${viewing.id}`} onClose={() => setViewing(null)}>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-[var(--muted)]">Inmueble</dt><dd className="mt-1 font-semibold">{viewing.property}</dd></div>
              <div><dt className="text-[var(--muted)]">Operación</dt><dd className="mt-1 font-semibold">{viewing.type === "venta" ? "Venta" : "Alquiler"}</dd></div>
              <div><dt className="text-[var(--muted)]">Cliente</dt><dd className="mt-1 font-semibold">{viewing.client}</dd></div>
              <div><dt className="text-[var(--muted)]">Asesor</dt><dd className="mt-1 font-semibold">{viewing.agent}</dd></div>
              <div><dt className="text-[var(--muted)]">Fecha de inicio</dt><dd className="mt-1 font-semibold">{String(viewing.start_date).slice(0, 10)}</dd></div>
              <div><dt className="text-[var(--muted)]">Monto</dt><dd className="mt-1 font-semibold">{money(Number(viewing.amount))}</dd></div>
            </dl>
            <div className="mt-6 flex justify-end">
              <Button
                icon="file"
                onClick={() => {
                  setShowPhysicalContract(true)
                  setShowPrintOptions(false)
                  setDocumentError("")
                }}
              >
                En físico
              </Button>
            </div>
          </Modal>
        )
      )}
    </>
  )
}
