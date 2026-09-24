import { useState } from 'react';
import type { User } from '../types';
import { PROPERTIES, VISITS, CONTRACTS } from '../data';
import Layout from './Layout';
import PropertyCard from './PropertyCard';

interface Props { user: User; onLogout: () => void; }

const NAV = [
  { id: 'propiedades', label: 'Buscar Propiedades', icon: '🔍' },
  { id: 'mis-visitas', label: 'Mis Visitas', icon: '📅' },
  { id: 'mis-contratos', label: 'Mis Contratos', icon: '📋' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pendiente: { bg: '#FEF3C7', text: '#92400E' },
  confirmada: { bg: '#DCFCE7', text: '#166534' },
  realizada: { bg: '#DBEAFE', text: '#1E40AF' },
  cancelada: { bg: '#FEE2E2', text: '#991B1B' },
  activo: { bg: '#DCFCE7', text: '#166534' },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: '#F5F5F5', text: '#555' };
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

export default function ClienteDashboard({ user, onLogout }: Props) {
  const [active, setActive] = useState('propiedades');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const myVisits = VISITS.filter(v => v.clientId === user.id);
  const myContracts = CONTRACTS.filter(c => c.clientId === user.id);

  const availableProps = PROPERTIES.filter(p =>
    p.status === 'disponible' &&
    (typeFilter === 'todos' || p.type === typeFilter)
  );

  const handleRequestVisit = (propId: string) => {
    setShowConfirm(propId);
  };

  const confirmRequest = () => {
    if (showConfirm) {
      setRequested(prev => new Set([...prev, showConfirm]));
      setShowConfirm(null);
    }
  };

  return (
    <Layout
      user={user}
      onLogout={onLogout}
      nav={NAV}
      active={active}
      onNav={setActive}
      accentColor="#D97706"
    >
      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: 'var(--color-surface)' }}>
            <h3 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
              Solicitar Visita
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
              Se enviará tu solicitud de visita. Un agente se pondrá en contacto contigo para confirmar la fecha y hora.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-2 rounded-lg text-sm border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmRequest}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: '#B91C1C' }}
              >
                Confirmar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {active === 'propiedades' && (
        <div>
          <div className="mb-6">
            <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>
              Propiedades Disponibles
            </h2>
            <p style={{ color: 'var(--color-muted)' }}>
              Explora los inmuebles disponibles en Huancayo y el Valle del Mantaro.
            </p>
          </div>

          {/* Access level notice */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 border"
            style={{ background: '#FEF3C7', borderColor: '#FDE68A' }}
          >
            <span className="text-lg">👁️</span>
            <p className="text-sm" style={{ color: '#92400E' }}>
              <strong>Acceso de consulta —</strong> Puedes ver propiedades disponibles y solicitar visitas. Para contratos y negociaciones, un agente te contactará.
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {['todos', 'venta', 'alquiler'].map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
                style={{
                  background: typeFilter === f ? '#D97706' : 'var(--color-surface)',
                  color: typeFilter === f ? '#fff' : 'var(--color-muted)',
                  border: `1px solid ${typeFilter === f ? '#D97706' : 'var(--color-border)'}`,
                }}
              >
                {f === 'todos' ? 'Todos los tipos' : f === 'venta' ? '🏷 En Venta' : '🔑 En Alquiler'}
              </button>
            ))}
          </div>

          {requested.size > 0 && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 border"
              style={{ background: '#DCFCE7', borderColor: '#BBF7D0' }}
            >
              <span>✅</span>
              <p className="text-sm" style={{ color: '#166534' }}>
                Tienes {requested.size} solicitud{requested.size > 1 ? 'es' : ''} de visita enviada{requested.size > 1 ? 's' : ''}. Un agente te contactará pronto.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {availableProps.map(p => (
              <div key={p.id} className="relative">
                <PropertyCard property={p} onRequestVisit={handleRequestVisit} />
                {requested.has(p.id) && (
                  <div className="absolute inset-0 rounded-xl flex items-center justify-center" style={{ background: 'rgba(21,128,61,0.12)', border: '2px solid #15803D' }}>
                    <span className="bg-green-700 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                      ✓ Solicitud enviada
                    </span>
                  </div>
                )}
              </div>
            ))}
            {availableProps.length === 0 && (
              <div className="col-span-3 py-12 text-center" style={{ color: 'var(--color-muted)' }}>
                No hay propiedades disponibles en esta categoría en este momento.
              </div>
            )}
          </div>
        </div>
      )}

      {active === 'mis-visitas' && (
        <div>
          <div className="mb-6">
            <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>Mis Visitas</h2>
            <p style={{ color: 'var(--color-muted)' }}>Seguimiento de tus solicitudes de visita.</p>
          </div>
          {myVisits.length === 0 && requested.size === 0 && (
            <div
              className="rounded-xl border p-8 text-center"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="text-4xl mb-3">📅</div>
              <p className="font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>No tienes visitas programadas</p>
              <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
                Explora las propiedades disponibles y solicita una visita.
              </p>
              <button
                onClick={() => setActive('propiedades')}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: '#B91C1C' }}
              >
                Ver Propiedades
              </button>
            </div>
          )}
          <div className="space-y-3">
            {myVisits.map(v => (
              <div key={v.id} className="rounded-xl border p-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-foreground)' }}>{v.propertyTitle}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      Agente: {v.agentName} · 📅 {v.date} a las {v.time}
                    </p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === 'mis-contratos' && (
        <div>
          <div className="mb-6">
            <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>Mis Contratos</h2>
            <p style={{ color: 'var(--color-muted)' }}>Consulta tus contratos de compra y alquiler. Solo lectura.</p>
          </div>

          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 border"
            style={{ background: '#FEF3C7', borderColor: '#FDE68A' }}
          >
            <span>ℹ️</span>
            <p className="text-sm" style={{ color: '#92400E' }}>
              Puedes consultar el estado de tus contratos. Para modificaciones, comunícate con tu agente asignado.
            </p>
          </div>

          {myContracts.length === 0 && (
            <div
              className="rounded-xl border p-8 text-center"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="text-4xl mb-3">📋</div>
              <p style={{ color: 'var(--color-muted)' }}>No tienes contratos registrados aún.</p>
            </div>
          )}
          <div className="space-y-3">
            {myContracts.map(c => (
              <div key={c.id} className="rounded-xl border p-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{c.code}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-foreground)' }}>{c.propertyTitle}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                      {c.type === 'alquiler' ? `Alquiler desde ${c.startDate} hasta ${c.endDate}` : `Contrato de venta firmado el ${c.startDate}`}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      Agente: {c.agentName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold" style={{ color: '#15803D' }}>
                      S/. {c.amount.toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {c.type === 'alquiler' ? '/mes' : 'precio final'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
