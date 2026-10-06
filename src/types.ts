export type Role = "admin" | "agent" | "client"

export type Theme = "light" | "dark"

export interface User {
  id: string

  name: string

  email: string

  role: Role
}

export interface Property {
  id: string

  code: string

  title: string

  district: string

  address: string

  price: number

  operation: string

  status: string

  bedrooms: number

  bathrooms: number

  area: number

  image: string

  agentId: string

  agentName: string

  agentPhone?: string

  agentEmail?: string

  typeId?: string

  zoneId?: string
}

export interface PropertyComment {
  id: number | string
  property_id: number | string
  author: string
  text: string
  is_sample: boolean | number
  visible?: boolean | number
  created_at: string
}

export interface Agent {
  id: string

  name: string

  email: string

  phone: string

  zone: string

  sales: number

  volume: number

  status: "Activo" | "Vacaciones" | "Inactivo"
}

export interface Client {
  id: string

  code: string

  name: string

  email: string

  phone: string

  preference: string

  budget: number

  status: "Nuevo" | "En seguimiento" | "Cliente"
}

export interface Visit {
  id: string

  propertyId: string

  property: string

  clientId: string

  client: string

  agentId: string

  agent: string

  date: string

  time: string

  status: "Programada" | "Confirmada" | "Realizada" | "Cancelada"
}

export interface Contract {
  id: string

  property: string

  clientId: string

  client: string

  agentId: string

  agent: string

  type: "Venta" | "Alquiler"

  amount: number

  date: string

  status: "Activo" | "Completado" | "Borrador" | "Vencido"
}

export interface ShellProps {
  user: User

  theme: Theme

  onThemeToggle: () => void

  onLogout: () => void
}

export interface NavItem {
  id: string

  label: string

  icon: string
}
