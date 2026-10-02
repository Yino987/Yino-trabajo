import { useState } from "react"
import AppShell from "../../components/AppShell"
import type { NavItem, ShellProps } from "../../types"
import AdminDashboard from "./AdminDashboard"
import AdminProperties from "./AdminProperties"
import AdminClients from "./AdminClients"
import AdminAgents from "./AdminAgents"
import AdminVisits from "./AdminVisits"
import AdminContracts from "./AdminContracts"
import AdminReports from "./AdminReports"

const nav: NavItem[] = [
  { id: "dashboard", label: "Vista general", icon: "dashboard" },
  { id: "properties", label: "Propiedades", icon: "building" },
  { id: "clients", label: "Clientes", icon: "users" },
  { id: "agents", label: "Agentes", icon: "badge" },
  { id: "visits", label: "Agenda y visitas", icon: "calendar" },
  { id: "contracts", label: "Contratos", icon: "file" },
  { id: "reports", label: "Reportes", icon: "chart" },
]

export default function AdminApp(props: ShellProps) {
  const [active, setActive] = useState("dashboard")
  const pages: Record<string, React.ReactNode> = {
    dashboard: <AdminDashboard onNavigate={setActive} />,
    properties: <AdminProperties />,
    clients: <AdminClients />,
    agents: <AdminAgents />,
    visits: <AdminVisits />,
    contracts: <AdminContracts />,
    reports: <AdminReports />,
  }
  return (
    <AppShell {...props} nav={nav} active={active} onNavigate={setActive}>
      {pages[active]}
    </AppShell>
  )
}
