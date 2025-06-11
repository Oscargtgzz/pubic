
import type {
  User,
  NotificationPreferences,
  CatalogItem,
  ModelCatalogItem,
  Vehicle,
  MaintenanceEvent,
  Incident,
  MaintenanceRule,
  NotificationItem,
  VehicleStatus,
  MaintenanceType,
  IncidentDamageLevel,
  IncidentStatus,
  VehicleDocument,
} from "@/lib/types";
import { addDays, subDays, formatISO } from 'date-fns';

// --- Helper Functions ---
const generateId = () => crypto.randomUUID();
const today = new Date();

// --- User Profile ---
export const mockUserProfile: User = {
  id: generateId(),
  name: "Sra. Administradora FleetFox",
  email: "admin@fleetfoxdemo.com",
  avatarUrl: "https://placehold.co/150x150/3F51B5/FFFFFF.png?text=AF", // Primary color background
};

// --- Notification Preferences ---
export const mockNotificationPreferences: NotificationPreferences = {
  maintenance_upcoming: true,
  maintenance_overdue: true,
  verification_upcoming: true,
  incident_new: true,
  incident_status_update: true,
  document_expiry: true,
};

// --- Catalogs ---
export const mockBrands: CatalogItem[] = [
  { id: generateId(), name: "Ford" },
  { id: generateId(), name: "Chevrolet" },
  { id: generateId(), name: "Nissan" },
  { id: generateId(), name: "Toyota" },
  { id: generateId(), name: "Volkswagen" },
  { id: generateId(), name: "BMW" },
  { id: generateId(), name: "Mercedes-Benz" },
];

export const mockModels: ModelCatalogItem[] = [
  // Ford
  { id: generateId(), name: "Ranger", brandId: mockBrands[0].id },
  { id: generateId(), name: "Focus", brandId: mockBrands[0].id },
  { id: generateId(), name: "Explorer", brandId: mockBrands[0].id },
  // Chevrolet
  { id: generateId(), name: "Spark", brandId: mockBrands[1].id },
  { id: generateId(), name: "Aveo", brandId: mockBrands[1].id },
  { id: generateId(), name: "Tahoe", brandId: mockBrands[1].id },
  // Nissan
  { id: generateId(), name: "Versa", brandId: mockBrands[2].id },
  { id: generateId(), name: "Sentra", brandId: mockBrands[2].id },
  { id: generateId(), name: "Kicks", brandId: mockBrands[2].id },
  // Toyota
  { id: generateId(), name: "Yaris", brandId: mockBrands[3].id },
  { id: generateId(), name: "Corolla", brandId: mockBrands[3].id },
  { id: generateId(), name: "RAV4", brandId: mockBrands[3].id },
  // Volkswagen
  { id: generateId(), name: "Jetta", brandId: mockBrands[4].id },
  { id: generateId(), name: "Tiguan", brandId: mockBrands[4].id },
  { id: generateId(), name: "Polo", brandId: mockBrands[4].id },
];

export const mockServiceTypes: CatalogItem[] = [
  { id: generateId(), name: "Cambio de Aceite y Filtro" },
  { id: generateId(), name: "Servicio Menor (10,000km)" },
  { id: generateId(), name: "Servicio Mayor (30,000km)" },
  { id: generateId(), name: "Revisión de Frenos" },
  { id: generateId(), name: "Alineación y Balanceo" },
  { id: generateId(), name: "Diagnóstico General" },
  { id: generateId(), name: "Verificación Emisiones Semestral" },
];

export const mockWorkshops: CatalogItem[] = [
  { 
    id: generateId(), 
    name: "Taller Central FleetFox",
    managerName: "Juan Pérez",
    address: "Av. Principal 123, Col. Centro",
    city: "Ciudad de México",
    state: "CDMX",
    phone: "55-1234-5678",
    email: "contacto@tallercentralff.com"
  },
  { 
    id: generateId(), 
    name: "ServiAuto Express",
    managerName: "Ana López",
    address: "Calle Norte 45, Industrial Vallejo",
    city: "Ciudad de México",
    state: "CDMX",
    phone: "55-9876-5432",
    email: "servicios@serviautoexpress.com.mx"
  },
  { 
    id: generateId(), 
    name: "Mecánica Especializada del Sur",
    managerName: "Carlos Gómez",
    address: "Insurgentes Sur 1020, Del Valle",
    city: "Ciudad de México",
    state: "CDMX",
    phone: "55-5555-4444",
    email: "citas@mecanicadelsur.mx"
  },
  { 
    id: generateId(), 
    name: "Llantera El Veloz",
    managerName: "Sofía Ramírez",
    address: "Eje 3 Oriente 500",
    city: "Nezahualcóyotl",
    state: "Estado de México",
    phone: "55-2222-3333",
    email: "ventas@llanteraelveloz.com"
  },
  { 
    id: generateId(), 
    name: "Concesionario Autorizado Principal",
    managerName: "Roberto Sánchez",
    address: "Paseo de la Reforma 300",
    city: "Ciudad de México",
    state: "CDMX",
    phone: "55-7777-8888",
    email: "servicio@concesionarioprincipal.com"
  },
];

// --- Vehicles ---
const vehiclePlates = ["ABC-123", "XYZ-789", "QWE-456", "JKL-007", "GHI-321", "MNO-654", "PQR-987", "STU-111", "VWX-222", "YZA-333", "BCD-444", "EFG-555", "HIJ-666", "KLM-777", "NOP-888", "QRS-999", "TUV-000", "WXY-101", "ZAB-202", "CDE-303"];
const vehicleStatuses: VehicleStatus[] = ["Operativo", "En Taller", "Siniestrado", "Operativo", "Operativo"];
const mockDocs: VehicleDocument[] = [
    { name: "Tarjeta de Circulación.pdf", url: "#doc1" },
    { name: "Póliza de Seguro Vigente.pdf", url: "#doc2" },
    { name: "Verificación Anterior.jpg", url: "#doc3" },
];

export const mockVehicles: Vehicle[] = Array.from({ length: 20 }).map((_, i) => {
  const brand = mockBrands[i % mockBrands.length];
  const brandModels = mockModels.filter(m => m.brandId === brand.id);
  const model = brandModels.length > 0 ? brandModels[i % brandModels.length] : { name: "Modelo Genérico", id: "generic" };
  const year = 2018 + (i % 7); // Years from 2018 to 2024
  const currentMileage = 15000 + (i * 3500);
  const status = vehicleStatuses[i % vehicleStatuses.length];
  const acquisitionDate = formatISO(subDays(today, 365 * (2024 - year) + (i*30) ), { representation: 'date' });
  
  let nextServiceDate: string | null = null;
  let nextServiceMileage: number | null = null;
  if (status === "Operativo" && i % 3 === 0) {
    nextServiceDate = formatISO(addDays(today, 30 + i * 5), { representation: 'date' });
    nextServiceMileage = currentMileage + 10000;
  }

  let nextVerificationDate: string | null = null;
  if (status === "Operativo" && i % 4 === 0) {
    nextVerificationDate = formatISO(addDays(today, 60 + i * 7), { representation: 'date' });
  }

  return {
    id: `vehicle-${i + 1}-${generateId().substring(0,4)}`, // More readable IDs for mocking
    plate: vehiclePlates[i] || `FLX-${100 + i}`,
    brand: brand.name,
    model: model.name,
    year: year,
    status: status,
    currentMileage: currentMileage,
    photoUrl: `https://placehold.co/600x400/${['3F51B5', '009688', '7E57C2'][i%3]}/FFFFFF.png?text=${brand.name}+${model.name.replace(" ","+")}`,
    serialNumber: `VIN-${brand.name.substring(0,3).toUpperCase()}${year}${10000 + i}`,
    color: ["Rojo", "Azul", "Blanco", "Negro", "Gris"][i % 5],
    insurancePolicy: `POL-${year}-${2000 + i}`,
    insuranceExpiryDate: formatISO(addDays(today, 90 + i * 15), { representation: 'date' }),
    circulationCard: `TC-${year}-${3000 + i}`,
    documents: i % 4 === 0 ? mockDocs.slice(0, (i % 3) + 1) : undefined, // Add some documents to some vehicles
    notes: `Vehículo de prueba ${i + 1}. ${status === "En Taller" ? "Revisión general en progreso." : ""}`,
    lastUpdated: subDays(today, i).toISOString(),
    acquisitionDate: acquisitionDate,
    nextServiceDate,
    nextServiceMileage,
    nextVerificationDate,
  };
});

// --- Maintenance Events ---
export const mockMaintenanceEvents: MaintenanceEvent[] = [];
mockVehicles.forEach((vehicle, vIndex) => {
  const numEvents = 1 + (vIndex % 3); // 1 to 3 events per vehicle
  for (let i = 0; i < numEvents; i++) {
    const eventDate = subDays(today, 30 + (i * 60) + (vIndex * 10));
    const serviceType = mockServiceTypes[i % mockServiceTypes.length];
    const workshop = mockWorkshops[i % mockWorkshops.length];
    mockMaintenanceEvents.push({
      id: generateId(),
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plate,
      date: formatISO(eventDate, { representation: 'date' }),
      mileage: vehicle.currentMileage - (5000 * (i + 1)) > 0 ? vehicle.currentMileage - (5000 * (i + 1)) : 500 + i*100,
      type: serviceType.name.toLowerCase().includes("verificación") ? "Verificación" : "Servicio",
      serviceType: serviceType.name,
      workshop: workshop.name,
      cost: parseFloat((1500 + (i * 250) + (Math.random() * 500)).toFixed(2)),
      notes: `Mantenimiento de rutina ${i + 1} para ${vehicle.plate}.`,
      lastUpdated: eventDate.toISOString(),
    });
  }
});

// --- Incidents ---
const incidentDamageLevels: IncidentDamageLevel[] = ["Leve", "Moderado", "Leve", "Pérdida Total", "Moderado"];
const incidentStatuses: IncidentStatus[] = ["Cerrado", "En Reparación", "Abierto", "Cerrado", "En Evaluación"];

export const mockIncidents: Incident[] = [];
mockVehicles.slice(0, 10).forEach((vehicle, vIndex) => { // Only for first 10 vehicles
  if (vIndex % 2 === 0) { // Incidents for every other vehicle among these 10
    const incidentDate = subDays(today, 45 + (vIndex * 20));
    mockIncidents.push({
      id: generateId(),
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plate,
      date: formatISO(incidentDate, { representation: 'date' }),
      time: "14:30",
      description: `Colisión menor con ${vIndex % 3 === 0 ? 'poste' : 'otro vehículo'} en Av. Insurgentes.`,
      damageLevel: incidentDamageLevels[vIndex % incidentDamageLevels.length],
      status: incidentStatuses[vIndex % incidentStatuses.length],
      location: "Av. Insurgentes y Calle Roble",
      notes: `Reporte policial #${7000 + vIndex}. Se contactó al seguro.`,
      lastUpdated: incidentDate.toISOString(),
    });
  }
});

// --- Maintenance Rules ---
export const mockMaintenanceRules: MaintenanceRule[] = [
  {
    id: generateId(),
    name: "Servicio Básico Cada 10,000 km o 6 Meses",
    vehicleType: "Todos", // Applies to all if assignedVehicleIds is not set or empty
    mileageInterval: 10000,
    timeIntervalMonths: 6,
    serviceTasks: "Cambio de aceite, filtro de aceite, revisión de niveles, rotación de llantas.",
    lastUpdated: today.toISOString(),
  },
  {
    id: generateId(),
    name: "Servicio Mayor Sedán Cada 30,000 km",
    vehicleType: "Sedán", // Can still be used as a general category if no specific IDs
    mileageInterval: 30000,
    serviceTasks: "Incluye servicio básico más revisión de frenos, bujías, filtro de aire.",
    lastUpdated: today.toISOString(),
  },
  {
    id: generateId(),
    name: "Revisión Especial Transmisión - Ranger",
    assignedVehicleIds: mockVehicles.filter(v => v.model === "Ranger").slice(0,1).map(v => v.id), // Assign to first Ranger
    mileageInterval: 50000,
    serviceTasks: "Revisión exhaustiva de transmisión y cambio de fluidos para Ford Ranger.",
    lastUpdated: today.toISOString(),
  },
  {
    id: generateId(),
    name: "Verificación Semestral CDMX",
    vehicleType: "Todos",
    timeIntervalMonths: 6,
    serviceTasks: "Verificación de emisiones contaminantes según calendario oficial.",
    lastUpdated: today.toISOString(),
  },
  {
    id: generateId(),
    name: "Servicio Flotilla XYZ",
    assignedVehicleIds: [mockVehicles[1]?.id, mockVehicles[3]?.id].filter(id => !!id) as string[], // Assign to specific vehicles by ID
    timeIntervalMonths: 12,
    serviceTasks: "Servicio anual completo para vehículos de la flotilla XYZ.",
    lastUpdated: today.toISOString(),
  },
];

// --- Notifications ---
export const mockNotifications: NotificationItem[] = [];
// Upcoming Maintenance
mockVehicles.filter(v => v.nextServiceDate).slice(0,3).forEach((v, i) => {
    mockNotifications.push({
        id: generateId(),
        type: "Servicio",
        title: `Mantenimiento Próximo: ${v.plate}`,
        message: `Servicio programado para ${v.nextServiceDate} o ${v.nextServiceMileage?.toLocaleString()} km.`,
        date: subDays(today, 2).toISOString(),
        isRead: i % 2 === 0,
        link: `/fleet/${v.id}`,
        severity: "Warning",
        vehicleId: v.id,
        vehiclePlate: v.plate,
    });
});
// Overdue Maintenance (example)
const overdueVehicle = mockVehicles[5];
if (overdueVehicle) {
    mockNotifications.push({
        id: generateId(),
        type: "Servicio",
        title: `Mantenimiento Vencido: ${overdueVehicle.plate}`,
        message: `El servicio programado para ${formatISO(subDays(today, 10),{representation: 'date'})} está vencido. Kilometraje actual: ${overdueVehicle.currentMileage.toLocaleString()} km.`,
        date: subDays(today, 1).toISOString(),
        isRead: false,
        link: `/fleet/${overdueVehicle.id}`,
        severity: "Critical",
        vehicleId: overdueVehicle.id,
        vehiclePlate: overdueVehicle.plate,
    });
}
// Incident Update
mockIncidents.slice(0,2).forEach((incident, i) => {
    mockNotifications.push({
        id: generateId(),
        type: "Siniestro",
        title: `Actualización Siniestro: ${incident.vehiclePlate}`,
        message: `El siniestro #${incident.id.substring(0,8)}... ahora está en estado: ${incident.status}.`,
        date: subDays(today, 1 + i).toISOString(),
        isRead: i % 2 !== 0,
        link: `/fleet/${incident.vehicleId}`,
        severity: "Info",
        vehicleId: incident.vehicleId,
        vehiclePlate: incident.vehiclePlate,
    });
});
// Document Expiry (example)
const docExpiryVehicle = mockVehicles[8];
if (docExpiryVehicle && docExpiryVehicle.insuranceExpiryDate) {
     mockNotifications.push({
        id: generateId(),
        type: "General",
        title: `Vencimiento Próximo: Póliza ${docExpiryVehicle.plate}`,
        message: `La póliza de seguro ${docExpiryVehicle.insurancePolicy} vence el ${docExpiryVehicle.insuranceExpiryDate}.`,
        date: subDays(today, 3).toISOString(),
        isRead: true,
        link: `/fleet/${docExpiryVehicle.id}`,
        severity: "Warning",
        vehicleId: docExpiryVehicle.id,
        vehiclePlate: docExpiryVehicle.plate,
    });
}
// General Notification
mockNotifications.push({
    id: generateId(),
    type: "General",
    title: "Recordatorio: Actualizar Catálogos",
    message: "No olvides mantener actualizados los catálogos de modelos y tipos de servicio.",
    date: subDays(today, 5).toISOString(),
    isRead: true,
    link: "/settings/catalogs",
    severity: "Info",
});

// Add a few more for variety
mockVehicles.filter(v => v.nextVerificationDate).slice(0,2).forEach((v, i) => {
    mockNotifications.push({
        id: generateId(),
        type: "Verificación",
        title: `Verificación Próxima: ${v.plate}`,
        message: `La verificación vehicular está programada para ${v.nextVerificationDate}.`,
        date: subDays(today, 4).toISOString(),
        isRead: false,
        link: `/fleet/${v.id}`,
        severity: "Warning",
        vehicleId: v.id,
        vehiclePlate: v.plate,
    });
});

// Ensure some mock rules have assignedVehicleIds to test the new feature
if (mockMaintenanceRules[1] && mockVehicles.length >= 2) {
  mockMaintenanceRules[1].assignedVehicleIds = [mockVehicles[0].id, mockVehicles[1].id];
}
if (mockMaintenanceRules[0] && mockVehicles.length >=3 && !mockMaintenanceRules[0].assignedVehicleIds ) {
    // For a rule previously set to "Todos", assign some specific vehicles to test
    mockMaintenanceRules[0].assignedVehicleIds = [mockVehicles[2].id];
    mockMaintenanceRules[0].vehicleType = undefined; // Clear vehicleType if specific IDs are assigned
}

// Make sure vehicle IDs in mockMaintenanceRules.assignedVehicleIds are valid
mockMaintenanceRules.forEach(rule => {
  if (rule.assignedVehicleIds) {
    rule.assignedVehicleIds = rule.assignedVehicleIds.filter(id => mockVehicles.some(v => v.id === id));
    if(rule.assignedVehicleIds.length === 0) delete rule.assignedVehicleIds; // Remove if no valid IDs remain
  }
});

// Add acquisitionDate to all mock vehicles if not present for validation demo
mockVehicles.forEach(vehicle => {
  if (!vehicle.acquisitionDate) {
    vehicle.acquisitionDate = formatISO(subDays(today, 365 * (2024 - vehicle.year) + (Math.random()*300) ), { representation: 'date' });
  }
});
