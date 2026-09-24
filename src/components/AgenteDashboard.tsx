import { useState } from 'react';
import type { User } from '../types';
import { PROPERTIES, VISITS, CONTRACTS } from '../data';
import Layout from './Layout';
import PropertyCard from './PropertyCard';

interface Props { user: User; onLogout: () => void; }

const NAV = [
  { id: 'dashboard', label: 'Mi Panel', icon: '📊' },
  { id: 'mis-propiedades', label: 'Mis Propiedades', icon: '🏠' },
  { id: 'visitas', label: 'Visitas', icon: '📅' },
  { id: 'contratos', label: 'Contratos', icon: '📋' },
  { id: 'reportes', label: 'Mis Reportes', icon: '📈' },
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

export default function AgenteDashboard({ user, onLogout }: Props) {
  const [active, setActive] = useState('dashboard');

  const myProps = PROPERTIES.filter(p => p.agentId === user.id);
  const myVisits = VISITS.filter(v => v.agentId === user.id);
  const myContracts = CONTRACTS.filter(c => c.agentId === user.id);

  return (
    <Layout
      user={user}
      onLogout={onLogout}
      nav={NAV}
      active={active}
      onNav={setActive}
      accentColor="#15803D"
    >
      {active === 'dashboard' && (
        <div>
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>
              Mi Panel — Agente
            </h2>
            <p style={{ color: 'var(--color-muted)' }}>
              Hola, {user.name.split(' ')[0]}. Aquí está el resumen de tu actividad.
            </p>
          </div>

          {/* Access level notice */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-8 border"
            style={{ background: '#DCFCE7', borderColor: '#BBF7D0' }}
          >
            <span className="text-lg">🔒</span>
            <div>
              <span className="text-sm font-semibold" style={{ color: '#166534' }}>Acceso Operativo — </span>
              <span className="text-sm" style={{ color: '#15803D' }}>
                Gestionas tus propiedades asignadas, agendas visitas y registras contratos. No tienes acceso a gestión de agentes, configuración ni reportes globales.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Mis Propiedades', val: myProps.length, color: '#B91C1C', icon: '🏠' },
              { label: 'Mis Visitas', val: myVisits.length, color: '#D97706', icon: '📅' },
              { label: 'Mis Contratos', val: myContracts.length, color: '#15803D', icon: '📋' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <span className="text-xl">{s.icon}</span>
                <div className="font-display text-3xl font-bold mt-2" style={{ color: s.color }}>{s.val}</div>
                <div className="text-sm" style={{ color: 'var(--color-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming visits */}
          <div className="rounded-xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--color-foreground)' }}>Próximas Visitas</h3>
              <button className="text-xs" style={{ color: '#15803D' }} onClick={() => setActive('visitas')}>Ver todas →</button>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {myVisits.length === 0 && (
                <div className="px-5 py-6 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
                  No tienes visitas asignadas aún.
                </div>
              )}
              {myVisits.map(v => (
                <div key={v.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>{v.propertyTitle}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                      Cliente: {v.clientName} · {v.date} a las {v.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={v.status} />
                    {v.status === 'pendiente' && (
                      <button className="text-xs px-2 py-1 rounded-lg" style={{ background: '#DCFCE7', color: '#166534' }}>
                        Confirmar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {active === 'mis-propiedades' && (
        <div>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>Mis Propiedades</h2>
              <p style={{ color: 'var(--color-muted)' }}>Inmuebles asignados a tu gestión.</p>
            </div>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#15803D' }}>
              + Actualizar Estado
            </button>
          </div>
          {myProps.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--color-muted)' }}>
              No tienes propiedades asignadas aún.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {myProps.map(p => (
                <PropertyCard key={p.id} property={p} isAgente />
              ))}
            </div>
          )}
        </div>
      )}

      {active === 'visitas' && (
        <div>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>Mis Visitas</h2>
              <p style={{ color: 'var(--color-muted)' }}>Visitas que debes atender. Solo las tuyas.</p>
            </div>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#15803D' }}>
              + Agendar Visita
            </button>
          </div>
          <div className="space-y-3">
            {myVisits.map(v => (
              <div key={v.id} className="rounded-xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--color-foreground)' }}>{v.propertyTitle}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      👤 {v.clientName} · 📅 {v.date} a las {v.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={v.status} />
                    {v.status === 'pendiente' && (
                      <>
                        <button className="text-xs px-2 py-1 rounded-lg" style={{ background: '#DCFCE7', color: '#166534' }}>Confirmar</button>
                        <button className="text-xs px-2 py-1 rounded-lg" style={{ background: '#FEE2E2', color: '#991B1B' }}>Cancelar</button>
                      </>
                    )}
                    {v.status === 'confirmada' && (
                      <button className="text-xs px-2 py-1 rounded-lg" style={{ background: '#DBEAFE', color: '#1E40AF' }}>Marcar Realizada</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === 'contratos' && (
        <div>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>Mis Contratos</h2>
              <p style={{ color: 'var(--color-muted)' }}>Contratos de venta y alquiler bajo tu gestión.</p>
            </div>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#15803D' }}>
              + Registrar Contrato
            </button>
          </div>
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
                      Cliente: {c.clientName} · {c.type} · Desde {c.startDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold" style={{ color: '#15803D' }}>
                      S/. {c.amount.toLocaleString()}
                    </div>
                    <div className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
                      {c.type === 'alquiler' ? '/mes' : 'total'}
                    </div>
                    <button className="text-xs px-3 py-1 rounded-lg" style={{ background: '#DBEAFE', color: '#1E40AF' }}>Ver Detalle</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === 'reportes' && (
        <div>
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>Mis Reportes</h2>
            <p style={{ color: 'var(--color-muted)' }}>Solo ves tus propias métricas, no las del sistema global.</p>
          </div>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 border"
            style={{ background: '#FEF3C7', borderColor: '#FDE68A' }}
          >
            <span>ℹ️</span>
            <p className="text-sm" style={{ color: '#92400E' }}>
              Como agente, tus reportes son individuales. El administrador tiene acceso a los reportes globales del sistema.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Propiedades Gestionadas', val: myProps.length, icon: '🏠', color: '#B91C1C' },
              { label: 'Visitas Realizadas', val: myVisits.filter(v => v.status === 'realizada').length, icon: '✅', color: '#15803D' },
              { label: 'Visitas Pendientes', val: myVisits.filter(v => v.status === 'pendiente').length, icon: '⏳', color: '#D97706' },
              { label: 'Contratos Activos', val: myContracts.filter(c => c.status === 'activo').length, icon: '📋', color: '#6366F1' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border p-6 flex items-center gap-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <div className="font-display text-4xl font-bold" style={{ color: s.color }}>{s.val}</div>
                  <div style={{ color: 'var(--color-muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
