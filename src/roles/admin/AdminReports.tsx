import { useEffect, useMemo, useState } from "react"

import { Button, Card, PageHeader } from "../../components/ui"

import type { DatabaseRow } from "../../utils/databaseApi"

import { getDatabaseTable, getDatabaseTables } from "../../utils/databaseApi"

import { exportRecords, type ExportFormat } from "../../utils/exportRecords"

const tableLabels: Record<string, string> = {
  asesores: "Asesores",
  clientes: "Clientes",
  comision: "Comisiones",
  comentario_inmueble: "Comentarios de inmuebles",

  contrato: "Contratos",

  estadosi: "Estados de inmuebles",

  historial_estado: "Historial de estados",

  imagen_inmueble: "Imágenes de inmuebles",

  inmueble: "Inmuebles",

  mantenimiento: "Mantenimientos",

  notificacion: "Notificaciones",

  pago: "Pagos",

  terreno_detalle: "Detalles de terrenos",

  tipo_inmueble: "Tipos de inmueble",

  visitant: "Visitas",

  zona: "Zonas",
}

function cellText(value: unknown) {
  if (value === null || value === undefined) return "—"

  if (typeof value === "object") return JSON.stringify(value)

  return String(value)
}

export default function AdminReports({ adminToken }: { adminToken: string }) {
  const [tables, setTables] = useState<string[]>([])

  const [table, setTable] = useState("")

  const [columns, setColumns] = useState<string[]>([])

  const [selectedColumns, setSelectedColumns] = useState<string[]>([])

  const [rows, setRows] = useState<DatabaseRow[]>([])
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [isLoadingTables, setIsLoadingTables] = useState(true)

  const [isLoadingRows, setIsLoadingRows] = useState(false)

  const [exporting, setExporting] = useState<ExportFormat | null>(null)

  useEffect(() => {
    let active = true

    setIsLoadingTables(true)

    getDatabaseTables(adminToken)

      .then((databaseTables) => {
        if (!active) return

        setTables(databaseTables)

        setTable(
          databaseTables.includes("inmueble")
            ? "inmueble"
            : (databaseTables[0] ?? ""),
        )

        setError("")
      })

      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "No se pudieron cargar las tablas.",
          )
        }
      })

      .finally(() => {
        if (active) setIsLoadingTables(false)
      })

    return () => {
      active = false
    }
  }, [adminToken])

  useEffect(() => {
    if (!table) {
      setRows([])

      setColumns([])

      return
    }

    let active = true

    setIsLoadingRows(true)

    setError("")

    getDatabaseTable(adminToken, table)

      .then((result) => {
        if (!active) return

        setColumns(result.columns)

        setSelectedColumns(result.columns)

        setRows(result.rows)
      })

      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "No se pudieron cargar los datos.",
          )

          setRows([])

          setColumns([])

          setSelectedColumns([])
        }
      })

      .finally(() => {
        if (active) setIsLoadingRows(false)
      })

    return () => {
      active = false
    }
  }, [adminToken, table])

  const filteredRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()

    if (!term) return rows

    return rows.filter((row) =>
      columns.some((column) =>
        cellText(row[column]).toLocaleLowerCase().includes(term),
      ),
    )
  }, [columns, rows, search])

  const toggleColumn = (column: string) => {
    setSelectedColumns((current) =>
      current.includes(column)
        ? current.filter((item) => item !== column)
        : [...current, column],
    )
  }

  const handleExport = async (format: ExportFormat) => {
    if (!table || !selectedColumns.length || !filteredRows.length) return

    setExporting(format)
    setError("")
    setSuccess("")
    try {
      await exportRecords(format, table, selectedColumns, filteredRows)
      setSuccess(
        `Se preparó el archivo ${format.toUpperCase()} con ${filteredRows.length} registros.`,
      )
    } catch (cause) {
      setError(
        cause instanceof Error
          ? `No se pudo generar el archivo: ${cause.message}`
          : "No se pudo generar el archivo.",
      )
    } finally {
      setExporting(null)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Administración local"
        title="Base de datos y exportaciones"
        description="Explora las tablas de Inmobiliaria y elige exactamente qué registros y columnas exportar."
      />

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="mb-5 rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand-soft)] px-4 py-3 text-sm text-[var(--brand)]"
        >
          {success}
        </div>
      )}

      <Card className="mb-5 grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <label className="block text-sm font-semibold">
          ¿Qué información quieres consultar?
          <select
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm text-[var(--text)]"
            value={table}
            onChange={(event) => setTable(event.target.value)}
            disabled={isLoadingTables || tables.length === 0}
          >
            {tables.length === 0 && (
              <option value="">Sin tablas disponibles</option>
            )}
            {tables.map((name) => (
              <option key={name} value={name}>
                {tableLabels[name] ?? name.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Buscar en los registros
          <input
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm font-normal text-[var(--text)]"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filtra por cualquier dato de la tabla"
            disabled={!rows.length}
          />
        </label>
        <p className="text-sm text-[var(--muted)] md:col-span-2">
          {isLoadingTables
            ? "Conectando con MySQL local…"
            : `${tables.length} tablas · ${filteredRows.length} de ${rows.length} registros coinciden`}
        </p>
      </Card>

      <Card className="mb-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">
              Campos que vas a incluir
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Marca solo las columnas necesarias para tu archivo.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setSelectedColumns(columns)}
              disabled={!columns.length}
            >
              Seleccionar todos
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSelectedColumns([])}
              disabled={!selectedColumns.length}
            >
              Limpiar
            </Button>
          </div>
        </div>
        <div className="mt-4 grid max-h-52 gap-2 overflow-auto sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((column) => (
            <label
              key={column}
              className="flex items-center gap-2 rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={selectedColumns.includes(column)}
                onChange={() => toggleColumn(column)}
              />
              <span className="break-all">{column}</span>
            </label>
          ))}
          {!columns.length && (
            <p className="text-sm text-[var(--muted)]">
              Selecciona una tabla para ver sus campos.
            </p>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] p-5">
          <div>
            <h2 className="font-display text-xl font-bold">Vista previa</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Se exportarán los {filteredRows.length} registros filtrados y las{" "}
              {selectedColumns.length} columnas seleccionadas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              icon="download"
              onClick={() => void handleExport("excel")}
              disabled={
                isLoadingRows ||
                exporting !== null ||
                !selectedColumns.length ||
                !filteredRows.length
              }
            >
              {exporting === "excel" ? "Preparando Excel…" : "Excel"}
            </Button>
            <Button
              variant="secondary"
              icon="download"
              onClick={() => void handleExport("pdf")}
              disabled={
                isLoadingRows ||
                exporting !== null ||
                !selectedColumns.length ||
                !filteredRows.length
              }
            >
              {exporting === "pdf" ? "Preparando PDF…" : "PDF"}
            </Button>
            <Button
              variant="secondary"
              icon="download"
              onClick={() => void handleExport("word")}
              disabled={
                isLoadingRows ||
                exporting !== null ||
                !selectedColumns.length ||
                !filteredRows.length
              }
            >
              {exporting === "word" ? "Preparando Word…" : "Word"}
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
                {selectedColumns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--muted)]"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.slice(0, 25).map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  {selectedColumns.map((column) => (
                    <td key={column} className="max-w-80 px-4 py-3 text-sm">
                      <span
                        className="block truncate"
                        title={cellText(row[column])}
                      >
                        {cellText(row[column])}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              {!isLoadingRows && !filteredRows.length && (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm text-[var(--muted)]"
                    colSpan={Math.max(selectedColumns.length, 1)}
                  >
                    {rows.length
                      ? "No hay registros que coincidan con la búsqueda."
                      : "La tabla no contiene registros o aún no se ha cargado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredRows.length > 25 && (
          <p className="border-t border-[var(--border)] px-5 py-3 text-sm text-[var(--muted)]">
            Vista previa de 25 registros; la exportación incluye los{" "}
            {filteredRows.length}.
          </p>
        )}
      </Card>
    </>
  )
}
