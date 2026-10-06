import type { PropertyComment } from "../types"

export interface PublicProperty {
  id: number | string

  address: string

  district: string

  area: number | string | null

  bedrooms: number | string | null

  bathrooms: number | string | null

  price: number | string

  status: string | null
  category: string | null
  type_id?: number | string | null
  zone_id?: number | string | null
  image_url: string | null
  agent_id: number | string | null

  agent_name: string | null
  agent_phone?: string | null
  agent_email?: string | null
}

export type DatabaseRow = Record<string, unknown>

export interface DatabaseClient {
  id: number
  first_name: string
  last_name: string
  dni: string
  phone: string | null
  email: string | null
  address: string | null
}

export interface DatabaseAgent {
  id: number
  first_name: string
  last_name: string
  phone: string | null
  email: string | null
  zone: string
  sales: number
  volume: number
}

export interface DatabaseVisit {
  id: number
  property_id: number
  property: string
  client_id: number
  client: string
  agent_id: number
  agent: string
  visit_date: string
  visit_time: string
  status: string
  notes: string | null
}

export interface DatabaseContract {
  id: number
  property_id: number
  property: string
  client_id: number
  client: string
  agent_id: number
  agent: string
  type: "venta" | "alquiler"
  amount: number
  start_date: string
  end_date: string | null
}

export interface PropertyOptions {
  states: Array<{ id: number; name: string }>
  types: Array<{ id: number; name: string }>
  agents: Array<{ id: number; name: string }>
  zones: Array<{ id: number; name: string }>
  properties: Array<{ id: number; name: string }>
  clients: Array<{ id: number; name: string }>
  availableProperties: Array<{ id: number; name: string }>
}

async function readResponse<T>(response: Response): Promise<T> {
  const result: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : "Ocurrió un error al consultar la base de datos."

    throw new Error(message)
  }

  return result as T
}

export async function getPublicProperties(): Promise<PublicProperty[]> {
  const response = await fetch("/api/properties")

  const result = await readResponse<{ rows: PublicProperty[] }>(response)

  return result.rows
}

async function adminRequest<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  })
  if (response.status === 204) return undefined as T
  return readResponse<T>(response)
}

function rows<T>(token: string, path: string) {
  return adminRequest<{ rows: T[] }>(token, path).then((result) => result.rows)
}

export const getAdminClients = (token: string) =>
  rows<DatabaseClient>(token, "/api/admin/clients")
export const getAdminAgents = (token: string) =>
  rows<DatabaseAgent>(token, "/api/admin/agents")
export const getAdminVisits = (token: string) =>
  rows<DatabaseVisit>(token, "/api/admin/visits")
export const getAdminContracts = (token: string) =>
  rows<DatabaseContract>(token, "/api/admin/contracts")

export function saveAdminRecord(
  token: string,
  entity: "clients" | "agents" | "visits" | "contracts" | "properties",
  id: number | null,
  data: Record<string, unknown>,
) {
  const method = id === null ? "POST" : "PATCH"
  const path = id === null ? `/api/admin/${entity}` : `/api/admin/${entity}/${id}`
  return adminRequest<{ id: number }>(token, path, {
    method,
    body: JSON.stringify(data),
  })
}

export function saveAccount(
  token: string,
  role: "cliente" | "agente",
  id: number,
  password: string,
) {
  return adminRequest<void>(token, "/api/admin/accounts", {
    method: "POST",
    body: JSON.stringify({ role, id, password }),
  })
}

export function getPropertyOptions(token: string) {
  return adminRequest<PropertyOptions>(token, "/api/admin/property-options")
}

export function getAdminDashboard(token: string) {
  return adminRequest<{
    activeProperties: number
    upcomingVisits: number
    sales: number
    activeAgents: number
  }>(token, "/api/admin/dashboard")
}

async function accountRequest<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  })
  if (response.status === 204) return undefined as T
  return readResponse<T>(response)
}

export const getClientVisits = (token: string) =>
  accountRequest<{ rows: DatabaseVisit[] }>(token, "/api/client/visits").then((result) => result.rows)
export const getClientContracts = (token: string) =>
  accountRequest<{ rows: DatabaseContract[] }>(token, "/api/client/contracts").then((result) => result.rows)
export const requestClientVisit = (
  token: string,
  data: { propertyId: number; date: string; time: string },
) =>
  accountRequest<{ id: number }>(token, "/api/client/visits", {
    method: "POST",
    body: JSON.stringify(data),
  })
export const createClientInterest = (token: string, propertyId: number) =>
  accountRequest<{ sent: boolean }>(token, "/api/client/interests", {
    method: "POST",
    body: JSON.stringify({ propertyId }),
  })
export const getAgentProperties = (token: string) =>
  accountRequest<{ rows: PublicProperty[] }>(token, "/api/agent/properties").then((result) => result.rows)
export const getAgentVisits = (token: string) =>
  accountRequest<{ rows: DatabaseVisit[] }>(token, "/api/agent/visits").then((result) => result.rows)
export const getAgentVisitOptions = (token: string) =>
  accountRequest<{
    properties: Array<{ id: number; name: string }>
    clients: Array<{ id: number; name: string }>
  }>(token, "/api/agent/options")
export function createAgentVisit(
  token: string,
  data: { propertyId: number; clientId: number; date: string; time: string; notes: string },
) {
  return accountRequest<{ id: number }>(token, "/api/agent/visits", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
export const getAgentContracts = (token: string) =>
  accountRequest<{ rows: DatabaseContract[] }>(token, "/api/agent/contracts").then((result) => result.rows)
export function updateAgentVisit(
  token: string,
  id: number,
  status: string,
  notes: string,
) {
  return accountRequest<void>(token, `/api/agent/visits/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, notes }),
  })
}

export async function getAdminProperties(
  token: string,
): Promise<PublicProperty[]> {
  const response = await fetch("/api/admin/properties", {
    headers: { Authorization: `Bearer ${token}` },
  })
  const result = await readResponse<{ rows: PublicProperty[] }>(response)
  return result.rows
}

export async function getClientPropertyComments(
  propertyId: string,
): Promise<{
  open: boolean
  comments: PropertyComment[]
}> {
  const response = await fetch(
    `/api/properties/${encodeURIComponent(propertyId)}/comments`,
  )
  return readResponse(response)
}

export async function getAdminPropertyComments(
  token: string,
  propertyId: string,
): Promise<{
  open: boolean
  comments: PropertyComment[]
}> {
  const response = await fetch(
    `/api/admin/properties/${encodeURIComponent(propertyId)}/comments`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return readResponse(response)
}

export async function setPropertyCommentsVisibility(
  token: string,
  propertyId: string,
  open: boolean,
): Promise<void> {
  const response = await fetch(
    `/api/admin/properties/${encodeURIComponent(propertyId)}/comments`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ open }),
    },
  )
  await readResponse(response)
}

export async function getDatabaseTables(token: string): Promise<string[]> {
  const response = await fetch("/api/admin/tables", {
    headers: { Authorization: `Bearer ${token}` },
  })

  const result = await readResponse<{ tables: string[] }>(response)

  return result.tables
}

export async function getDatabaseTable(
  token: string,

  table: string,
): Promise<{
  columns: string[]
  rows: DatabaseRow[]
}> {
  const response = await fetch(
    `/api/admin/tables/${encodeURIComponent(table)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  return readResponse(response)
}
