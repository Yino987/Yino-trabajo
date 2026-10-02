import Icon from "./Icon"

export default function MetricCard({
  label,
  value,
  note,
  icon,
  tone = "brand",
}: {
  label: string
  value: string
  note: string
  icon: string
  tone?: "brand" | "accent" | "gold" | "info"
}) {
  const colors = {
    brand: "bg-[var(--brand-soft)] text-[var(--brand)]",
    accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
    gold: "bg-[var(--warning-soft)] text-[var(--warning)]",
    info: "bg-[var(--info-soft)] text-[var(--info)]",
  }
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-5 flex items-start justify-between">
        <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
        <div className={`rounded-xl p-2.5 ${colors[tone]}`}>
          <Icon name={icon} size={19} />
        </div>
      </div>
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-[var(--muted)]">{note}</p>
    </div>
  )
}
