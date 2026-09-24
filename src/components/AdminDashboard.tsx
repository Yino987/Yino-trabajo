import { useState } from 'react';
import type { User } from '../types';
import { PROPERTIES, CLIENTS, AGENTS, VISITS, CONTRACTS } from '../data';
import Layout from './Layout';
import PropertyCard from './PropertyCard';

interface Props { user: User; onLogout: () => void; }

const NAV = [
  { id: 'dashboard', label: 'Panel Principal', icon: '📊' },
  { id: 'propiedades', label: 'Propiedades', icon: '🏠' },
  { id: 'clientes', label: 'Clientes', icon: '👥' },
  { id: 'agentes', label: 'Agentes', icon: '🤝' },
  { id: 'visitas', label: 'Visitas', icon: '📅' },
  { id: 'contratos', label: 'Contratos', icon: '📋' },
  { id: 'reportes', label: 'Reportes', icon: '📈' },
  { id: 'configuracion', label: 'Configuración', icon: '⚙️' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  disponible: { bg: '#DCFCE7', text: '#166534' },
  reservado: { bg: '#FEF3C7', text: '#92400E' },
  vendido: { bg: '#DBEAFE', text: '#1E40AF' },
  alquilado: { bg: '#E0E7FF', text: '#3730A3' },
  pendiente: { bg: '#FEF3C7', text: '#92400E' },
  confirmada: { bg: '#DCFCE7', text: '#166534' },
  realizada: { bg: '#DBEAFE', text: '#1E40AF' },
  cancelada: { bg: '#FEE2E2', text: '#991B1B' },
  activo: { bg: '#DCFCE7', text: '#166534' },
  cerrado: { bg: '#DBEAFE', text: '#1E40AF' },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: '#F5F5F5', text: '#555' };
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
      style={{ background: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div className="rounded-xl p-5 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
          <div className="w-3 h-3 rounded-full" style={{ background: color }} />
        </div>
      </div>
      <div className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>
        {value}
      </div>
      <div className="text-sm" style={{ color: 'var(--color-muted)' }}>{label}</div>
    </div>
  );
}

export default function AdminDashboard({ user, onLogout }: Props) {
  const [active, setActive] = useState('dashboard');
  const [propFilter, setPropFilter] = useState('todos');

  const filteredProps = propFilter === 'todos'
    ? PROPERTIES
    : PROPERTIES.filter(p => p.status === propFilter || p.type === propFilter);

  return (
    <Layout
      user={user}
      onLogout={onLogout}
      nav={NAV}
      active={active}
      onNav={setActive}
      accentColor="#B91C1C"
    >
      {active === 'dashboard' && (
        <div>
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>
              Panel de Administración
            </h2>
            <p style={{ color: 'var(--color-muted)' }}>
              Bienvenido, {user.name.split(' ')[0]}. Tienes acceso completo al sistema Huancayork.
            </p>
          </div>

          {/* Access level notice */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-8 border"
            style={{ background: '#FEE2E2', borderColor: '#FECACA' }}
          >
            <span className="text-lg">🔐</span>
            <div>
              <span className="text-sm font-semibold" style={{ color: '#991B1B' }}>Acceso Completo — </span>
              <span className="text-sm" style={{ color: '#B91C1C' }}>
                Administras propiedades, agentes, clientes, contratos, visitas, reportes y configuración del sistema.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Propiedades" value={PROPERTIES.length} icon="🏠" color="#B91C1C" />
            <StatCard label="Clientes" value={CLIENTS.length} icon="👥" color="#D97706" />
            <StatCard label="Agentes" value={AGENTS.length} icon="🤝" color="#15803D" />
            <StatCard label="Contratos Activos" value={CONTRACTS.filter(c => c.status === 'activo').length} icon="📋" color="#6366F1" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent visits */}
            <div className="rounded-xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--color-foreground)' }}>Visitas Recientes</h3>
                <button className="text-xs" style={{ color: '#B91C1C' }} onClick={() => setActive('visitas')}>Ver todas →</button>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {VISITS.slice(0, 4).map(v => (
                  <div key={v.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>{v.propertyTitle}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{v.clientName} · {v.date} {v.time}</p>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent contracts */}
            <div className="rounded-xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--color-foreground)' }}>Contratos Activos</h3>
                <button className="text-xs" style={{ color: '#B91C1C' }} onClick={() => setActive('contratos')}>Ver todos →</button>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {CONTRACTS.map(c => (
                  <div key={c.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>{c.code} — {c.type}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{c.clientName} · S/. {c.amount.toLocaleString()}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {active === 'propiedades' && (
        <div>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>Propiedades</h2>
              <p style={{ color: 'var(--color-muted)' }}>Registro y control de todos los inmuebles.</p>
            </div>
            <button
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#B91C1C' }}
            >
              + Nueva Propiedad
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['todos', 'disponible', 'reservado', 'vendido', 'venta', 'alquiler'].map(f => (
              <button
                key={f}
                onClick={() => setPropFilter(f)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
                style={{
                  background: propFilter === f ? '#B91C1C' : 'var(--color-surface)',
                  color: propFilter === f ? '#fff' : 'var(--color-muted)',
                  border: `1px solid ${propFilter === f ? '#B91C1C' : 'var(--color-border)'}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProps.map(p => (
              <PropertyCard key={p.id} property={p} isAdmin />
            ))}
          </div>
        </div>
      )}

      {active === 'clientes' && (
        <div>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>Clientes</h2>
              <p style={{ color: 'var(--color-muted)' }}>Registro y gestión de clientes del sistema.</p>
            </div>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#B91C1C' }}>
              + Nuevo Cliente
            </button>
          </div>
          <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                  {['Nombre', 'DNI', 'Correo', 'Teléfono', 'Registro', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CLIENTS.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < CLIENTS.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-foreground)' }}>{c.name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-muted)' }}>{c.dni}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-muted)' }}>{c.email}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-muted)' }}>{c.phone}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-muted)' }}>{c.registeredAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-xs px-2 py-1 rounded" style={{ background: '#DBEAFE', color: '#1E40AF' }}>Editar</button>
                        <button className="text-xs px-2 py-1 rounded" style={{ background: '#FEE2E2', color: '#991B1B' }}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {active === 'agentes' && (
        <div>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>Agentes Inmobiliarios</h2>
              <p style={{ color: 'var(--color-muted)' }}>Gestión del equipo de agentes.</p>
            </div>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#B91C1C' }}>
              + Nuevo Agente
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {AGENTS.map(a => (
              <div key={a.id} className="rounded-xl border p-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg" style={{ background: '#15803D' }}>
                    {a.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-foreground)' }}>{a.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{a.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[['Propiedades', a.properties, '#B91C1C'], ['Visitas', a.visits, '#D97706'], ['Contratos', a.contracts, '#15803D']].map(([l, v, c]) => (
                    <div key={l as string} className="text-center rounded-lg py-2" style={{ background: 'var(--color-surface-2)' }}>
                      <div className="font-bold text-lg" style={{ color: c as string }}>{v as number}</div>
                      <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{l as string}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 text-xs py-1.5 rounded-lg font-medium" style={{ background: '#DCFCE7', color: '#166534' }}>Ver Perfil</button>
                  <button className="flex-1 text-xs py-1.5 rounded-lg font-medium" style={{ background: '#DBEAFE', color: '#1E40AF' }}>Editar</button>
                  <button className="flex-1 text-xs py-1.5 rounded-lg font-medium" style={{ background: '#FEE2E2', color: '#991B1B' }}>Dar de Baja</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === 'visitas' && (
        <div>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>Gestión de Visitas</h2>
              <p style={{ color: 'var(--color-muted)' }}>Control de todas las visitas programadas.</p>
            </div>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#B91C1C' }}>
              + Programar Visita
            </button>
          </div>
          <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                  {['Propiedad', 'Cliente', 'Agente', 'Fecha y Hora', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VISITS.map((v, i) => (
                  <tr key={v.id} style={{ borderBottom: i < VISITS.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-xs" style={{ color: 'var(--color-foreground)' }}>{v.propertyTitle}</div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{v.clientName}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{v.agentName}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{v.date} · {v.time}</td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="text-xs px-2 py-1 rounded" style={{ background: '#DCFCE7', color: '#166534' }}>Confirmar</button>
                        <button className="text-xs px-2 py-1 rounded" style={{ background: '#FEE2E2', color: '#991B1B' }}>Cancelar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {active === 'contratos' && (
        <div>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>Contratos</h2>
              <p style={{ color: 'var(--color-muted)' }}>Registro y seguimiento de contratos de venta y alquiler.</p>
            </div>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#B91C1C' }}>
              + Nuevo Contrato
            </button>
          </div>
          <div className="space-y-3">
            {CONTRACTS.map(c => (
              <div key={c.id} className="rounded-xl border p-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{c.code}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: c.type === 'venta' ? '#DBEAFE' : '#E0E7FF', color: c.type === 'venta' ? '#1E40AF' : '#3730A3' }}>
                        {c.type}
                      </span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-foreground)' }}>{c.propertyTitle}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                      Cliente: {c.clientName} · Agente: {c.agentName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      Desde {c.startDate}{c.endDate ? ` hasta ${c.endDate}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold" style={{ color: '#15803D' }}>
                      S/. {c.amount.toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {c.type === 'alquiler' ? '/mes' : 'precio total'}
                    </div>
                    <div className="flex gap-2 mt-2 justify-end">
                      <button className="text-xs px-3 py-1 rounded-lg" style={{ background: '#DBEAFE', color: '#1E40AF' }}>Ver Contrato</button>
                      <button className="text-xs px-3 py-1 rounded-lg" style={{ background: '#FEE2E2', color: '#991B1B' }}>Cerrar</button>
                    </div>
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
            <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>Reportes del Sistema</h2>
            <p style={{ color: 'var(--color-muted)' }}>Análisis e indicadores de rendimiento de Huancayork.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Propiedades por Estado', icon: '🏠', items: [
                { label: 'Disponible', val: 3, color: '#15803D' },
                { label: 'Reservado', val: 1, color: '#D97706' },
                { label: 'Vendido', val: 1, color: '#6366F1' },
              ]},
              { title: 'Visitas por Estado', icon: '📅', items: [
                { label: 'Pendiente', val: 2, color: '#D97706' },
                { label: 'Confirmada', val: 1, color: '#15803D' },
                { label: 'Realizada', val: 1, color: '#6366F1' },
              ]},
              { title: 'Ventas por Agente', icon: '🤝', items: [
                { label: 'Carlos Quispe', val: 4, color: '#B91C1C' },
                { label: 'María Huanca', val: 3, color: '#D97706' },
              ]},
              { title: 'Tipos de Contrato', icon: '📋', items: [
                { label: 'Alquiler', val: 2, color: '#15803D' },
                { label: 'Venta', val: 1, color: '#B91C1C' },
              ]},
            ].map(report => (
              <div key={report.title} className="rounded-xl border p-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-foreground)' }}>
                  <span>{report.icon}</span>{report.title}
                </h3>
                <div className="space-y-3">
                  {report.items.map(item => {
                    const total = report.items.reduce((s, i) => s + i.val, 0);
                    const pct = Math.round((item.val / total) * 100);
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: 'var(--color-foreground)' }}>{item.label}</span>
                          <span style={{ color: 'var(--color-muted)' }}>{item.val} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: 'var(--color-surface-2)' }}>
                          <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: item.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button className="mt-4 text-xs font-medium" style={{ color: '#B91C1C' }}>Exportar reporte →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === 'configuracion' && (
        <div>
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>Configuración del Sistema</h2>
            <p style={{ color: 'var(--color-muted)' }}>Parámetros de seguridad, respaldo y configuración general.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Seguridad y Autenticación', icon: '🔐', items: ['Gestión de contraseñas', 'Control de sesiones', 'Auditoría de accesos', 'Roles y permisos'] },
              { title: 'Respaldo de Datos', icon: '💾', items: ['Copia de seguridad automática', 'Exportación de base de datos', 'Restauración de datos', 'Historial de respaldos'] },
              { title: 'Configuración de Empresa', icon: '🏢', items: ['Datos de Huancayork SAC', 'Logotipo y branding', 'Correo institucional', 'Términos y condiciones'] },
              { title: 'Notificaciones', icon: '🔔', items: ['Alertas de visitas', 'Vencimiento de contratos', 'Nuevos registros', 'Reportes programados'] },
            ].map(s => (
              <div key={s.title} className="rounded-xl border p-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-foreground)' }}>
                  <span>{s.icon}</span>{s.title}
                </h3>
                <ul className="space-y-2">
                  {s.items.map(item => (
                    <li key={item} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{item}</span>
                      <button className="text-xs px-2 py-1 rounded" style={{ background: '#FEE2E2', color: '#991B1B' }}>Editar</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
