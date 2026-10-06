import type { DatabaseRow } from "./databaseApi"

export type ExportFormat = "excel" | "pdf" | "word"

function cellText(value: unknown): string {
  if (value === null || value === undefined) return ""

  if (value instanceof Date) return value.toLocaleString("es-PE")

  if (typeof value === "object") return JSON.stringify(value)

  return String(value)
}

function filename(table: string) {
  const safeName = table

    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g, "")

    .replace(/[^a-zA-Z0-9_-]+/g, "-")

    .replace(/^-|-$/g, "")

    .toLowerCase()

  return `inmobiliaria-${safeName || "datos"}`
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function exportExcel(
  table: string,

  columns: string[],

  rows: DatabaseRow[],
) {
  const { default: ExcelJS } = await import("exceljs")

  const workbook = new ExcelJS.Workbook()

  const worksheet = workbook.addWorksheet("Datos")

  worksheet.addRow(columns)

  worksheet.getRow(1).font = { bold: true }

  rows.forEach((row) =>
    worksheet.addRow(columns.map((column) => cellText(row[column]))),
  )

  worksheet.columns = columns.map((column) => ({
    header: column,

    key: column,

    width: Math.min(Math.max(column.length + 4, 14), 32),
  }))

  const buffer = await workbook.xlsx.writeBuffer()

  download(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),

    `${filename(table)}.xlsx`,
  )
}

function exportPdf(table: string, columns: string[], rows: DatabaseRow[]) {
  return Promise.all([import("jspdf"), import("jspdf-autotable")]).then(
    ([{ jsPDF }, { default: autoTable }]) => {
      const document = new jsPDF({ orientation: "landscape" })

      document.setFontSize(14)

      document.text(`Inmobiliaria · ${table}`, 14, 14)

      autoTable(document, {
        head: [columns],

        body: rows.map((row) => columns.map((column) => cellText(row[column]))),

        startY: 20,

        styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak" },

        headStyles: { fillColor: [30, 79, 57] },
      })

      document.save(`${filename(table)}.pdf`)
    },
  )
}

async function exportWord(
  table: string,
  columns: string[],
  rows: DatabaseRow[],
) {
  const { Document, Packer, Paragraph, Table, TableCell, TableRow } =
    await import("docx")

  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: `Inmobiliaria · ${table}`,
            heading: "Heading1",
          }),

          new Table({
            rows: [
              new TableRow({
                tableHeader: true,

                children: columns.map(
                  (column) =>
                    new TableCell({
                      children: [new Paragraph({ text: column })],
                    }),
                ),
              }),

              ...rows.map(
                (row) =>
                  new TableRow({
                    children: columns.map(
                      (column) =>
                        new TableCell({
                          children: [
                            new Paragraph({ text: cellText(row[column]) }),
                          ],
                        }),
                    ),
                  }),
              ),
            ],
          }),
        ],
      },
    ],
  })

  download(await Packer.toBlob(document), `${filename(table)}.docx`)
}

export async function exportRecords(
  format: ExportFormat,

  table: string,

  columns: string[],

  rows: DatabaseRow[],
) {
  if (format === "excel") return exportExcel(table, columns, rows)

  if (format === "pdf") return exportPdf(table, columns, rows)

  return exportWord(table, columns, rows)
}
