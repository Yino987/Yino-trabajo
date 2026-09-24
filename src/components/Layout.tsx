import type { User } from '../types';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface Props {
  user: User;
  onLogout: () => void;
  nav: NavItem[];
  active: string;
  onNav: (id: string) => void;
  children: React.ReactNode;
  accentColor: string;
}

export default function Layout({ user, onLogout, nav, active, onNav, children, accentColor }: Props) {
  const roleLabel = user.role === 'admin' ? 'Administrador' : user.role === 'agente' ? 'Agente Inmobiliario' : 'Cliente';
  const roleBg = user.role === 'admin' ? '#FEE2E2' : user.role === 'agente' ? '#DCFCE7' : '#FEF3C7';
  const roleColor = user.role === 'admin' ? '#991B1B' : user.role === 'agente' ? '#166534' : '#92400E';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-background)' }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b shrink-0 sticky top-0 z-30"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {['#B91C1C','#D97706','#15803D'].map((c, i) => (
              <div key={i} style={{ width: 4, height: 24, background: c, borderRadius: 2 }} />
            ))}
          </div>
          <span className="font-display text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            Huanca<span style={{ color: '#D97706' }}>york</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-foreground)' }}>
              {user.name}
            </p>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: roleBg, color: roleColor }}
            >
              {roleLabel}
            </span>
          </div>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
            style={{ background: accentColor }}
          >
            {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <button
            onClick={onLogout}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            Salir
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className="w-56 shrink-0 border-r flex flex-col py-6 px-3 hidden md:flex sticky"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', top: 57, height: 'calc(100vh - 57px)' }}
        >
          <nav className="flex flex-col gap-1 flex-1">
            {nav.map(item => (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all"
                style={{
                  background: active === item.id ? accentColor + '18' : 'transparent',
                  color: active === item.id ? accentColor : 'var(--color-muted)',
                  fontWeight: active === item.id ? 600 : 400,
                  borderLeft: active === item.id ? `3px solid ${accentColor}` : '3px solid transparent',
                }}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Role badge at bottom */}
          <div className="mt-4 px-3">
            <div
              className="p-3 rounded-lg text-xs"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}
            >
              <div className="font-medium mb-0.5" style={{ color: 'var(--color-foreground)' }}>
                {roleLabel}
              </div>
              <div>{user.email}</div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
