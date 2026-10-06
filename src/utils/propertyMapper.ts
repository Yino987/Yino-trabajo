import type { Property } from "../types"

import type { PublicProperty } from "./databaseApi"

const fallbackImage =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=85"

export function mapDatabaseProperty(row: PublicProperty): Property {
  const district = row.district || "Ubicación no especificada"

  return {
    id: String(row.id),

    code: `INM-${row.id}`,

    title: `${row.category || "Inmueble"} en ${district}`,

    district,

    address: row.address || district,

    price: Number(row.price) || 0,

    operation: row.category || "Inmueble",

    status: row.status || "Sin estado",

    bedrooms: Number(row.bedrooms) || 0,

    bathrooms: Number(row.bathrooms) || 0,

    area: Number(row.area) || 0,

    image:
      row.image_url && /^https?:\/\//i.test(row.image_url)
        ? row.image_url
        : fallbackImage,

    agentId: row.agent_id === null ? "" : String(row.agent_id),

    agentName: row.agent_name || "Equipo inmobiliario",

    agentPhone: row.agent_phone || undefined,

    agentEmail: row.agent_email || undefined,

    typeId: row.type_id === null || row.type_id === undefined ? "" : String(row.type_id),

    zoneId: row.zone_id === null || row.zone_id === undefined ? "" : String(row.zone_id),
  }
}
