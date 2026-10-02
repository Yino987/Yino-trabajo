import MetricCard from "../../components/MetricCard"
import { contracts, properties, visits } from "../../data/mockData"
import { money } from "../../utils/format"
import Icon from "../../components/Icon"
import { Button, Card, PageHeader, StatusBadge } from "../../components/ui"

export default function AdminDashboard({
  onNavigate,
}: {
  onNavigate: (page: string) => void
}) {
  const revenue = contracts
    .filter((item) => item.type === "Venta")
    .reduce((sum, item) => sum + item.amount, 0)
  return (
    <>
      <PageHeader
        eyebrow="Panel administrativo"
        title="Buenos días, Seymon"
        description="Este es el pulso comercial de Huancayork. Los datos corresponden al periodo actual."
        actions={
          <Button
            icon="download"
            variant="secondary"
            onClick={() => onNavigate("reports")}
          >
            Ir a reportes
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Propiedades activas"
          value="24"
          note="6 nuevas este mes"
          icon="building"
        />
        <MetricCard
          label="Visitas agendadas"
          value="12"
          note="4 requieren confirmación"
          icon="calendar"
          tone="accent"
        />
        <MetricCard
          label="Ventas acumuladas"
          value={money(revenue)}
          note="+18% frente al periodo anterior"
          icon="chart"
          tone="gold"
        />
        <MetricCard
          label="Agentes activos"
          value="8"
          note="3 superaron su objetivo"
          icon="badge"
          tone="info"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">
                Rendimiento comercial
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Operaciones cerradas durante 2026
              </p>
            </div>
            <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand)]">
              +18.4%
            </span>
          </div>
          <div className="flex h-56 items-end gap-3 border-b border-l border-[var(--border)] px-4 pt-6">
            {[32, 46, 40, 58, 53, 72, 65, 83, 75, 91, 86, 100].map(
              (height, index) => (
                <div
                  key={index}
                  className="group relative flex-1 rounded-t-lg bg-[var(--brand-soft)] transition hover:bg-[var(--brand)]"
                  style={{ height: `${height}%` }}
                >
                  <span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 text-[10px] font-bold group-hover:block">
                    {height}k
                  </span>
                </div>
              ),
            )}
          </div>
          <div className="mt-3 flex justify-between px-4 text-[10px] font-semibold text-[var(--muted)]">
            <span>Ene</span>
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
            <span>Nov</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Próximas visitas</h2>
            <button
              onClick={() => onNavigate("visits")}
              className="text-xs font-bold text-[var(--brand)]"
            >
              Ver agenda
            </button>
          </div>
          <div className="space-y-3">
            {visits.slice(0, 3).map((visit) => (
              <div
                key={visit.id}
                className="flex gap-3 rounded-xl bg-[var(--surface-soft)] p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--accent)]">
                  <Icon name="calendar" size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{visit.property}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {visit.date} · {visit.time}
                  </p>
                </div>
                <StatusBadge status={visit.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="font-display text-xl font-bold">
              Inventario destacado
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Propiedades con actividad reciente
            </p>
          </div>
          <button
            onClick={() => onNavigate("properties")}
            className="text-sm font-bold text-[var(--brand)]"
          >
            Ver todas
          </button>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {properties.slice(0, 3).map((property) => (
            <div
              key={property.id}
              className="flex items-center gap-4 px-6 py-4"
            >
              <img
                src={property.image}
                alt=""
                className="h-14 w-18 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{property.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {property.code} · {property.district}
                </p>
              </div>
              <StatusBadge status={property.status} />
              <p className="hidden w-28 text-right text-sm font-bold sm:block">
                {money(property.price)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
