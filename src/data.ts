import type { Property, Client, Agent, Visit, Contract } from './types';

export const PROPERTIES: Property[] = [
  {
    id: 'p1', code: 'HY-001',
    title: 'Casa en El Tambo — 3 dormitorios',
    type: 'venta', status: 'disponible',
    price: 280000, currency: 'PEN',
    district: 'El Tambo', address: 'Jr. Moquegua 342, El Tambo',
    area: 180, bedrooms: 3, bathrooms: 2,
    agentId: 'a1', agentName: 'Carlos Quispe',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop&auto=format',
    description: 'Hermosa casa en zona residencial con jardín y cochera.',
  },
  {
    id: 'p2', code: 'HY-002',
    title: 'Departamento en Chilca — 2 dorm.',
    type: 'alquiler', status: 'disponible',
    price: 1200, currency: 'PEN',
    district: 'Chilca', address: 'Av. Grau 850, Chilca',
    area: 75, bedrooms: 2, bathrooms: 1,
    agentId: 'a2', agentName: 'María Huanca',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop&auto=format',
    description: 'Departamento moderno con vista a la avenida principal.',
  },
  {
    id: 'p3', code: 'HY-003',
    title: 'Local Comercial en Huancayo Centro',
    type: 'alquiler', status: 'reservado',
    price: 3500, currency: 'PEN',
    district: 'Huancayo', address: 'Jr. Real 512, Centro',
    area: 120, bedrooms: 0, bathrooms: 1,
    agentId: 'a1', agentName: 'Carlos Quispe',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format',
    description: 'Local en zona comercial de alto tránsito, primer piso.',
  },
  {
    id: 'p4', code: 'HY-004',
    title: 'Casa de Campo en Sicaya',
    type: 'venta', status: 'disponible',
    price: 420000, currency: 'PEN',
    district: 'Sicaya', address: 'Km 8 Carretera Sicaya',
    area: 350, bedrooms: 4, bathrooms: 3,
    agentId: 'a2', agentName: 'María Huanca',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop&auto=format',
    description: 'Amplia propiedad con huerto y vista al Valle del Mantaro.',
  },
  {
    id: 'p5', code: 'HY-005',
    title: 'Apartamento en San Carlos',
    type: 'venta', status: 'vendido',
    price: 195000, currency: 'PEN',
    district: 'San Carlos', address: 'Av. Mariscal Castilla 1820',
    area: 90, bedrooms: 2, bathrooms: 2,
    agentId: 'a1', agentName: 'Carlos Quispe',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop&auto=format',
    description: 'Apartamento bien ubicado cerca de la universidad.',
  },
];

export const CLIENTS: Client[] = [
  { id: 'c1', name: 'Rodrigo Palomino Yauri', email: 'rodrigo.p@gmail.com', phone: '964-112-388', dni: '45123678', registeredAt: '2025-01-15' },
  { id: 'c2', name: 'Lucía Torres Espinoza', email: 'lucia.torres@hotmail.com', phone: '951-234-567', dni: '43987654', registeredAt: '2025-02-10' },
  { id: 'c3', name: 'Jorge Mendoza Rivera', email: 'j.mendoza@empresa.com', phone: '955-890-123', dni: '41234567', registeredAt: '2025-03-05' },
  { id: 'c4', name: 'Ana Cárdenas Lima', email: 'ana.cardenas@gmail.com', phone: '971-456-789', dni: '47891234', registeredAt: '2025-04-20' },
];

export const AGENTS: Agent[] = [
  { id: 'a1', name: 'Carlos Quispe Flores', email: 'c.quispe@huancayork.pe', phone: '944-321-654', properties: 3, visits: 12, contracts: 4 },
  { id: 'a2', name: 'María Huanca Cóndor', email: 'm.huanca@huancayork.pe', phone: '966-789-012', properties: 2, visits: 8, contracts: 3 },
];

export const VISITS: Visit[] = [
  { id: 'v1', propertyId: 'p1', propertyTitle: 'Casa en El Tambo — 3 dormitorios', clientId: 'c1', clientName: 'Rodrigo Palomino Yauri', agentId: 'a1', agentName: 'Carlos Quispe Flores', date: '2025-09-28', time: '10:00', status: 'confirmada' },
  { id: 'v2', propertyId: 'p2', propertyTitle: 'Departamento en Chilca — 2 dorm.', clientId: 'c2', clientName: 'Lucía Torres Espinoza', agentId: 'a2', agentName: 'María Huanca Cóndor', date: '2025-09-29', time: '15:30', status: 'pendiente' },
  { id: 'v3', propertyId: 'p4', propertyTitle: 'Casa de Campo en Sicaya', clientId: 'c3', clientName: 'Jorge Mendoza Rivera', agentId: 'a2', agentName: 'María Huanca Cóndor', date: '2025-09-25', time: '09:00', status: 'realizada' },
  { id: 'v4', propertyId: 'p1', propertyTitle: 'Casa en El Tambo — 3 dormitorios', clientId: 'c4', clientName: 'Ana Cárdenas Lima', agentId: 'a1', agentName: 'Carlos Quispe Flores', date: '2025-10-02', time: '11:00', status: 'pendiente' },
];

export const CONTRACTS: Contract[] = [
  { id: 'ct1', code: 'CT-2025-001', propertyId: 'p5', propertyTitle: 'Apartamento en San Carlos', clientId: 'c1', clientName: 'Rodrigo Palomino Yauri', agentId: 'a1', agentName: 'Carlos Quispe Flores', type: 'venta', amount: 195000, currency: 'PEN', startDate: '2025-08-01', status: 'activo' },
  { id: 'ct2', code: 'CT-2025-002', propertyId: 'p2', propertyTitle: 'Departamento en Chilca — 2 dorm.', clientId: 'c2', clientName: 'Lucía Torres Espinoza', agentId: 'a2', agentName: 'María Huanca Cóndor', type: 'alquiler', amount: 1200, currency: 'PEN', startDate: '2025-07-15', endDate: '2026-07-14', status: 'activo' },
  { id: 'ct3', code: 'CT-2025-003', propertyId: 'p3', propertyTitle: 'Local Comercial en Huancayo Centro', clientId: 'c3', clientName: 'Jorge Mendoza Rivera', agentId: 'a1', agentName: 'Carlos Quispe Flores', type: 'alquiler', amount: 3500, currency: 'PEN', startDate: '2025-09-01', endDate: '2026-08-31', status: 'activo' },
];
