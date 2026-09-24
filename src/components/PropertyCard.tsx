import type { Property } from '../types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  disponible: { bg: '#DCFCE7', text: '#166534' },
  reservado: { bg: '#FEF3C7', text: '#92400E' },
  vendido: { bg: '#DBEAFE', text: '#1E40AF' },
  alquilado: { bg: '#E0E7FF', text: '#3730A3' },
};

interface Props {
  property: Property;
  isAdmin?: boolean;
  isAgente?: boolean;
  onRequestVisit?: (id: string) => void;
}

export default function PropertyCard({ property: p, isAdmin, isAgente, onRequestVisit }: Props) {
  const sc = STATUS_COLORS[p.status] ?? { bg: '#F5F5F5', text: '#555' };
  return (
    <div className="rounded-xl border overflow-hidden flex flex-col hover:shadow-md transition-shadow" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="relative h-44 shrink-0" style={{ background: '#E5DDD0' }}>
        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: sc.bg, color: sc.text }}>
            {p.status}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: 'var(--color-foreground)', color: '#FBF7F0' }}>
            {p.type}
          </span>
        </div>
        {(isAdmin || isAgente) && (
          <div className="absolute top-2 right-2">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
              {p.code}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-semibold text-sm leading-snug mb-1" style={{ color: 'var(--color-foreground)' }}>{p.title}</h4>
        <p className="text-xs mb-3" style={{ color: 'var(--color-muted)' }}>📍 {p.address}</p>
        <div className="flex gap-3 text-xs mb-3" style={{ color: 'var(--color-muted)' }}>
          {p.bedrooms > 0 && <span>🛏 {p.bedrooms} dorm.</span>}
          <span>🚿 {p.bathrooms} baños</span>
          <span>📐 {p.area} m²</span>
        </div>
        {(isAdmin || isAgente) && (
          <p className="text-xs mb-3" style={{ color: 'var(--color-muted)' }}>
            👤 Agente: {p.agentName}
          </p>
        )}
        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <div>
              <div className="font-display text-xl font-bold" style={{ color: '#15803D' }}>
                S/. {p.price.toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {p.type === 'alquiler' ? '/mes' : 'precio venta'}
              </div>
            </div>
            <div className="flex gap-1">
              {(isAdmin || isAgente) && (
                <button className="text-xs px-2 py-1 rounded-lg" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                  Editar
                </button>
              )}
              {!isAdmin && !isAgente && p.status === 'disponible' && (
                <button
                  onClick={() => onRequestVisit?.(p.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: '#B91C1C' }}
                >
                  Solicitar Visita
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
