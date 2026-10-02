import { useState } from "react"
import AppShell from "../../components/AppShell"
import type { NavItem, ShellProps } from "../../types"
import AgentDashboard from "./AgentDashboard"
import AgentProperties from "./AgentProperties"
import AgentVisits from "./AgentVisits"
import AgentContracts from "./AgentContracts"
import AgentReports from "./AgentReports"

const nav: NavItem[] = [
  { id: "dashboard", label: "Mi panel", icon: "dashboard" },
  { id: "properties", label: "Mi cartera", icon: "building" },
  { id: "visits", label: "Mis visitas", icon: "calendar" },
  { id: "contracts", label: "Contratos", icon: "file" },
  { id: "reports", label: "Mis resultados", icon: "chart" },
]

export default function AgentApp(props: ShellProps) {
  const [active, setActive] = useState("dashboard")
  const pages: Record<string, React.ReactNode> = {
    dashboard: <AgentDashboard onNavigate={setActive} />,
    properties: <AgentProperties />,
    visits: <AgentVisits />,
    contracts: <AgentContracts />,
    reports: <AgentReports />,
  }
  return (
    <AppShell {...props} nav={nav} active={active} onNavigate={setActive}>
      {pages[active]}
    </AppShell>
  )
}
