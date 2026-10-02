export const money = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value)

export function exportCsv(
  filename: string,
  rows: Array<Record<string, string | number>>,
) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const escape = (value: string | number) =>
    `"${String(value).replaceAll('"', '""')}"`
  const content = [
    headers.map(escape).join(","),
    ...rows.map((row) =>
      headers.map((header) => escape(row[header])).join(","),
    ),
  ].join("\n")
  const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
