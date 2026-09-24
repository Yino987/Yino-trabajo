export type Role = 'admin' | 'agente' | 'cliente';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatar?: string;
}

export interface Property {
  id: string;
  code: string;
  title: string;
  type: 'venta' | 'alquiler';
  status: 'disponible' | 'reservado' | 'vendido' | 'alquilado';
  price: number;
  currency: 'PEN' | 'USD';
  district: string;
  address: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  agentId: string;
  agentName: string;
  image: string;
  description: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  dni: string;
  registeredAt: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  properties: number;
  visits: number;
  contracts: number;
}

export interface Visit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientId: string;
  clientName: string;
  agentId: string;
  agentName: string;
  date: string;
  time: string;
  status: 'pendiente' | 'confirmada' | 'realizada' | 'cancelada';
}

export interface Contract {
  id: string;
  code: string;
  propertyId: string;
  propertyTitle: string;
  clientId: string;
  clientName: string;
  agentId: string;
  agentName: string;
  type: 'venta' | 'alquiler';
  amount: number;
  currency: 'PEN' | 'USD';
  startDate: string;
  endDate?: string;
  status: 'activo' | 'cerrado' | 'cancelado';
}
