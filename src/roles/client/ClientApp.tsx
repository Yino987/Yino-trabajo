import { useState } from "react"
import AppShell from "../../components/AppShell"
import type { NavItem, Property, ShellProps } from "../../types"
import ClientProperties from "./ClientProperties"
import ClientVisits from "./ClientVisits"
import ClientContracts from "./ClientContracts"
import Modal from "../../components/Modal"
import { Button } from "../../components/ui"
import Icon from "../../components/Icon"

const nav: NavItem[] = [
  { id: "properties", label: "Explorar propiedades", icon: "search" },
  { id: "visits", label: "Mis visitas", icon: "calendar" },
  { id: "contracts", label: "Mis contratos", icon: "file" },
]

export default function ClientApp(props: ShellProps) {
  const [active, setActive] = useState("properties")
  const [requested, setRequested] = useState<string[]>([])
  const [modal, setModal] = useState<{
    type: "request" | "contact"
    property: Property
  } | null>(null)
  const confirmRequest = () => {
    if (modal) setRequested((current) => [...current, modal.property.id])
    setModal(null)
  }
  const pages: Record<string, React.ReactNode> = {
    properties: (
      <ClientProperties
        requested={requested}
        onRequest={(property) => setModal({ type: "request", property })}
        onContact={(property) => setModal({ type: "contact", property })}
      />
    ),
    visits: (
      <ClientVisits
        requestedCount={requested.length}
        onExplore={() => setActive("properties")}
      />
    ),
    contracts: <ClientContracts />,
  }
  return (
    <AppShell {...props} nav={nav} active={active} onNavigate={setActive}>
      {pages[active]}
      {modal && (
        <Modal
          title={
            modal.type === "request"
              ? "Solicitar una visita"
              : "Contactar al agente"
          }
          onClose={() => setModal(null)}
        >
          {modal.type === "request" ? (
            <>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Solicitarás una visita a{" "}
                <b className="text-[var(--text)]">{modal.property.title}</b>. El
                agente confirmará contigo la fecha y hora.
              </p>
              <div className="mt-5 rounded-2xl bg-[var(--surface-soft)] p-4 text-sm">
                <p className="font-bold">{modal.property.agentName}</p>
                <p className="mt-1 text-[var(--muted)]">
                  Agente responsable · Respuesta estimada: 30 min
                </p>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setModal(null)}>
                  Cancelar
                </Button>
                <Button onClick={confirmRequest}>Confirmar solicitud</Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 rounded-2xl bg-[var(--brand-soft)] p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)] font-bold text-white">
                  {modal.property.agentName
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <p className="font-bold">{modal.property.agentName}</p>
                  <p className="text-sm text-[var(--muted)]">
                    Especialista en {modal.property.district}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm text-[var(--muted)]">
                Consulta por{" "}
                <b className="text-[var(--text)]">{modal.property.title}</b>.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button icon="phone">Llamar ahora</Button>
                <Button variant="secondary">
                  <Icon name="file" size={17} />
                  Enviar mensaje
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
    </AppShell>
  )
}
