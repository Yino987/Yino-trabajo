import { useState } from 'react';
import type { Role, User } from './types';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import AgenteDashboard from './components/AgenteDashboard';
import ClienteDashboard from './components/ClienteDashboard';

const DEMO_USERS: Record<Role, User> = {
  admin: { id: 'admin1', name: 'Luis Alberto Rojas', role: 'admin', email: 'admin@huancayork.pe' },
  agente: { id: 'a1', name: 'Carlos Quispe Flores', role: 'agente', email: 'c.quispe@huancayork.pe' },
  cliente: { id: 'c1', name: 'Rodrigo Palomino Yauri', role: 'cliente', email: 'rodrigo.p@gmail.com' },
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (role: Role) => {
    setUser(DEMO_USERS[role]);
  };

  const handleLogout = () => setUser(null);

  if (!user) return <LoginPage onLogin={handleLogin} />;
  if (user.role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} />;
  if (user.role === 'agente') return <AgenteDashboard user={user} onLogout={handleLogout} />;
  return <ClienteDashboard user={user} onLogout={handleLogout} />;
}
