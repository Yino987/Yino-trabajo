import { useEffect, useState } from "react"

import AppShell from "../../components/AppShell"
import Icon from "../../components/Icon"
import Modal from "../../components/Modal"
import { Button, Input } from "../../components/ui"
import type { NavItem, Property, ShellProps } from "../../types"
import {
  createClientInterest,
  getClientVisits,
  requestClientVisit,
} from "../../utils/databaseApi"
import ClientContracts from "./ClientContracts"
import ClientProperties from "./ClientProperties"
import ClientVisits from "./ClientVisits"

const nav: NavItem[] = [
  { id: "properties", label: "Explorar propiedades", icon: "search" },
  { id: "visits", label: "Mis visitas", icon: "calendar" },
  { id: "contracts", label: "Mis contratos", icon: "file" },
]

function defaultVisitDate() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

export default function ClientApp(props: ShellProps & { accountToken: string }) {
  const [active, setActive] = useState("properties")
  const [requested, setRequested] = useState<string[]>([])
  const [visitDate, setVisitDate] = useState(defaultVisitDate)
  const [visitTime, setVisitTime] = useState("10:00")
  const [requestError, setRequestError] = useState("")
  const [notice, setNotice] = useState("")
  const [noticeIsError, setNoticeIsError] = useState(false)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [modal, setModal] = useState<{
    type: "request" | "contact"
    property: Property
  } | null>(null)

  useEffect(() => {
    let activeRequest = true
    getClientVisits(props.accountToken)
      .then((visits) => {
        if (activeRequest) {
          setRequested(
            visits
              .filter((visit) =>
                ["Programada", "Confirmada"].includes(visit.status) &&
                new Date(`${visit.visit_date}T${visit.visit_time}:00`).getTime() >= Date.now(),
              )
              .map((visit) => String(visit.property_id)),
          )
        }
      })
      .catch((cause: unknown) => {
        console.error("No se pudieron cargar las visitas del cliente.", cause)
      })
    return () => { activeRequest = false }
  }, [props.accountToken])

  const confirmRequest = async () => {
    if (!modal) return
    setIsSubmittingRequest(true)
    setRequestError("")
    try {
      await requestClientVisit(props.accountToken, {
        propertyId: Number(modal.property.id),
        date: visitDate,
        time: visitTime,
      })
      setRequested((current) => [...new Set([...current, modal.property.id])])
      setNotice("Solicitud de visita guardada en Inmobiliaria.")
      setNoticeIsError(false)
      setModal(null)
    } catch (cause) {
      setRequestError(cause instanceof Error ? cause.message : "No se pudo enviar la solicitud.")
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  const pages: Record<string, React.ReactNode> = {
    properties: (
      <ClientProperties
        requested={requested}
        onRequest={(property) => {
          setVisitDate(defaultVisitDate())
          setVisitTime("10:00")
          setRequestError("")
          setModal({ type: "request", property })
        }}
        onContact={(property) => setModal({ type: "contact", property })}
        onAcquire={(property) => {
          void createClientInterest(props.accountToken, Number(property.id))
            .then(() => {
              setNotice("Tu solicitud de información se registró en Inmobiliaria.")
              setNoticeIsError(false)
            })
            .catch((cause: unknown) => {
              setNotice(cause instanceof Error ? cause.message : "No se pudo registrar el interés.")
              setNoticeIsError(true)
            })
        }}
      />
    ),
    visits: (
      <ClientVisits
        accountToken={props.accountToken}
        onExplore={() => setActive("properties")}
      />
    ),
    contracts: <ClientContracts accountToken={props.accountToken} />,
  }

  return (
    <AppShell {...props} nav={nav} active={active} onNavigate={setActive}>
      {pages[active]}
      {notice && (
        <p role={noticeIsError ? "alert" : "status"} className={`fixed bottom-5 right-5 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${noticeIsError ? "bg-[var(--danger)]" : "bg-[var(--brand)]"}`}>
          {notice}
          <button className="ml-3" onClick={() => setNotice("")} aria-label="Cerrar aviso">×</button>
        </p>
      )}
      {modal && (
        <Modal
          title={modal.type === "request" ? "Solicitar una visita" : "Contactar al asesor"}
          onClose={() => setModal(null)}
        >
          {modal.type === "request" ? (
            <>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Selecciona un horario para visitar <b className="text-[var(--text)]">{modal.property.title}</b>.
              </p>
              <div className="mt-5 rounded-2xl bg-[var(--surface-soft)] p-4 text-sm">
                <p className="font-bold">{modal.property.agentName}</p>
                <p className="mt-1 text-[var(--muted)]">Asesor responsable</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold">Fecha
                  <Input type="date" required min={new Date().toISOString().slice(0, 10)} value={visitDate} onChange={(event) => setVisitDate(event.target.value)} className="mt-2" />
                </label>
                <label className="text-sm font-semibold">Hora
                  <Input type="time" required value={visitTime} onChange={(event) => setVisitTime(event.target.value)} className="mt-2" />
                </label>
              </div>
              {requestError && <p role="alert" className="mt-3 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">{requestError}</p>}
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" disabled={isSubmittingRequest} onClick={() => setModal(null)}>Cancelar</Button>
                <Button disabled={isSubmittingRequest} onClick={() => void confirmRequest()}>{isSubmittingRequest ? "Enviando…" : "Confirmar solicitud"}</Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 rounded-2xl bg-[var(--brand-soft)] p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)] font-bold text-white">
                  {modal.property.agentName.split(" ").map((word) => word[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="font-bold">{modal.property.agentName}</p>
                  <p className="text-sm text-[var(--muted)]">Asesor inmobiliario</p>
                </div>
              </div>
              <p className="mt-5 text-sm text-[var(--muted)]">
                Consulta por <b className="text-[var(--text)]">{modal.property.title}</b>.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {modal.property.agentPhone ? (
                  <a href={`tel:${modal.property.agentPhone}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">
                    <Icon name="phone" size={17} /> Llamar
                  </a>
                ) : <Button disabled icon="phone">Teléfono no registrado</Button>}
                {modal.property.agentEmail ? (
                  <a href={`mailto:${modal.property.agentEmail}?subject=${encodeURIComponent(`Consulta por ${modal.property.title}`)}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">
                    <Icon name="file" size={17} /> Enviar correo
                  </a>
                ) : <Button variant="secondary" disabled><Icon name="file" size={17} />Correo no registrado</Button>}
              </div>
            </>
          )}
        </Modal>
      )}
    </AppShell>
  )
}
