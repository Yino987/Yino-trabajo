import type { ReactNode } from "react"

export default function DataTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: ReactNode[][]
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
            {headers.map((header) => (
              <th
                key={header}
                className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-soft)]/60"
            >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-5 py-4 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
