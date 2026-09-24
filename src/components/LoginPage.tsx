import { useState } from 'react';
import type { Role } from '../types';

interface Props {
  onLogin: (role: Role) => void;
}

const ROLES = [
  {
    id: 'admin' as Role,
    label: 'Administrador',
    icon: '⚙️',
    desc: 'Control total del sistema. Gestiona propiedades, agentes, clientes, contratos, visitas y reportes.',
    badge: 'Acceso Completo',
    color: 'primary',
  },
  {
    id: 'agente' as Role,
    label: 'Agente Inmobiliario',
    icon: '🏘️',
    desc: 'Gestiona propiedades asignadas, agenda visitas y registra contratos. Módulos operativos.',
    badge: 'Acceso Operativo',
    color: 'secondary',
  },
  {
    id: 'cliente' as Role,
    label: 'Cliente',
    icon: '🔑',
    desc: 'Consulta propiedades disponibles, solicita visitas y da seguimiento a sus solicitudes.',
    badge: 'Consulta y Solicitud',
    color: 'accent',
  },
];

export default function LoginPage({ onLogin }: Props) {
  const [selected, setSelected] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) onLogin(selected);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-background)' }}>
      {/* Header cultural strip */}
      <div style={{ background: 'var(--color-primary)', height: 5 }} />

      <div className="flex flex-1">
        {/* Left panel — branding */}
        <div
          className="hidden lg:flex flex-col justify-between p-12 w-[480px] shrink-0"
          style={{ background: 'var(--color-foreground)', color: '#F5EFE4' }}
        >
          <div>
            {/* Cantuta decorative motif */}
            <div className="flex gap-1 mb-10">
              {['#B91C1C','#D97706','#15803D'].map((c, i) => (
                <div key={i} style={{ width: 12, height: 48, background: c, borderRadius: 6 }} />
              ))}
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight mb-4" style={{ color: '#FBF7F0' }}>
              Huanca<span style={{ color: '#D97706' }}>york</span>
            </h1>
            <p className="text-lg font-light leading-relaxed" style={{ color: '#C8B89A' }}>
              Plataforma inmobiliaria orgullosamente huancaína. Encuentra tu propiedad ideal en el Valle del Mantaro.
            </p>
          </div>

          {/* Cultural elements */}
          <div className="space-y-6">
            <div className="border-t pt-6" style={{ borderColor: '#3D2F22' }}>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#78614A' }}>
                Inspirado en Junín
              </p>
              <div className="flex gap-3 flex-wrap">
                {['🌸 Cantuta', '🦅 Cóndor Andino', '💃 Chonguinada', '🌾 Valle del Mantaro'].map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ background: '#2A1F16', color: '#C8B89A' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="flex gap-4 text-sm" style={{ color: '#78614A' }}>
                <div><span style={{ color: '#D97706' }} className="font-semibold">5</span> Propiedades</div>
                <div><span style={{ color: '#D97706' }} className="font-semibold">2</span> Agentes</div>
                <div><span style={{ color: '#D97706' }} className="font-semibold">4</span> Clientes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — login */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex gap-1 justify-center mb-3">
              {['#B91C1C','#D97706','#15803D'].map((c, i) => (
                <div key={i} style={{ width: 10, height: 36, background: c, borderRadius: 5 }} />
              ))}
            </div>
            <h1 className="font-display text-4xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              Huanca<span style={{ color: '#D97706' }}>york</span>
            </h1>
          </div>

          <div className="w-full max-w-lg">
            <h2 className="font-display text-3xl font-semibold mb-2" style={{ color: 'var(--color-foreground)' }}>
              Iniciar sesión
            </h2>
            <p className="mb-8" style={{ color: 'var(--color-muted)' }}>
              Selecciona tu rol para acceder al sistema.
            </p>

            {/* Role selector */}
            <div className="space-y-3 mb-8">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelected(r.id)}
                  className="w-full text-left p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: selected === r.id
                      ? (r.color === 'primary' ? '#B91C1C' : r.color === 'secondary' ? '#15803D' : '#D97706')
                      : 'var(--color-border)',
                    background: selected === r.id ? 'var(--color-surface)' : 'var(--color-surface)',
                    boxShadow: selected === r.id ? '0 0 0 4px ' + (r.color === 'primary' ? '#FEE2E2' : r.color === 'secondary' ? '#DCFCE7' : '#FEF3C7') : 'none',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>
                          {r.label}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: r.color === 'primary' ? '#FEE2E2' : r.color === 'secondary' ? '#DCFCE7' : '#FEF3C7',
                            color: r.color === 'primary' ? '#991B1B' : r.color === 'secondary' ? '#166534' : '#92400E',
                          }}
                        >
                          {r.badge}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                        {r.desc}
                      </p>
                    </div>
                    {selected === r.id && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: r.color === 'primary' ? '#B91C1C' : r.color === 'secondary' ? '#15803D' : '#D97706' }}
                      >
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@huancayork.pe"
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                  onFocus={e => e.target.style.borderColor = '#B91C1C'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                  onFocus={e => e.target.style.borderColor = '#B91C1C'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
              <button
                type="submit"
                disabled={!selected}
                className="w-full py-3 rounded-lg font-semibold text-sm transition-all mt-2"
                style={{
                  background: selected ? 'var(--color-primary)' : 'var(--color-border)',
                  color: selected ? '#fff' : 'var(--color-muted)',
                  cursor: selected ? 'pointer' : 'not-allowed',
                }}
              >
                {selected ? `Ingresar como ${ROLES.find(r => r.id === selected)?.label}` : 'Selecciona un rol para continuar'}
              </button>
            </form>

            <p className="mt-6 text-xs text-center" style={{ color: 'var(--color-muted)' }}>
              Demo — cualquier credencial funciona con el rol seleccionado
            </p>
          </div>
        </div>
      </div>

      {/* Bottom cultural bar */}
      <div
        className="text-center py-2 text-xs"
        style={{ background: 'var(--color-foreground)', color: '#78614A' }}
      >
        Huancayork SAC · Huancayo, Junín, Perú · {new Date().getFullYear()}
      </div>
    </div>
  );
}
