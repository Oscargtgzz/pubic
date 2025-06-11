
export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

export type VehicleStatus = "Operativo" | "En Taller" | "Siniestrado" | "Baja";
export type MaintenanceType = "Servicio" | "Verificación";
export type IncidentDamageLevel = "Leve" | "Moderado" | "Pérdida Total";
export type IncidentStatus = "Abierto" | "En Evaluación" | "Esperando Refacciones" | "En Reparación" | "Reparado/Esperando Entrega" | "Cerrado";

export interface VehicleDocument {
  name: string;
  url: string; 
  type?: string; 
  size?: number;
  lastModified?: number;
}

export type Vehicle = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status: VehicleStatus;
  currentMileage: number;
  nextServiceDate?: string | null;
  nextServiceMileage?: number | null;
  nextVerificationDate?: string | null;
  photoUrl?: string | null;
  serialNumber?: string;
  engineNumber?: string;
  color?: string;
  insurancePolicy?: string;
  insuranceExpiryDate?: string | null;
  circulationCard?: string;
  documents?: VehicleDocument[];
  notes?: string;
  lastUpdated: string;
  acquisitionDate?: string; // Added for validation purposes
};

export interface MaintenanceDocument {
  name: string;
  url: string;
  type?: string;
  size?: number;
  lastModified?: number;
}

export type MaintenanceEvent = {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  date: string; // YYYY-MM-DD
  mileage: number;
  type: MaintenanceType;
  serviceType: string;
  workshop?: string; // Name of the workshop
  cost?: number;
  notes?: string;
  documents?: MaintenanceDocument[];
  lastUpdated: string;
};


export interface IncidentDocument {
  name: string;
  url: string; 
  type?: string; 
  size?: number;
  lastModified?: number;
}
export interface IncidentPhoto {
  name: string;
  url: string; 
  size?: number;
  type?: string; // image/jpeg, image/png
}


export type Incident = {
  id: string;
  vehicleId: string;
  vehiclePlate: string; 
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  description: string;
  damageLevel: IncidentDamageLevel;
  status: IncidentStatus;
  location?: string;
  thirdPartyName?: string;
  thirdPartyVehiclePlate?: string;
  thirdPartyInsurance?: string;
  notes?: string; 
  workshop?: string; 
  estimatedResolutionDate?: string | null;
  lastUpdated: string;
};

export type NotificationItem = {
  id: string;
  type: "Servicio" | "Verificación" | "Siniestro" | "General";
  title: string;
  message: string;
  date: string; // ISO String date
  isRead: boolean;
  link?: string;
  severity: "Info" | "Warning" | "Critical";
  vehicleId?: string;
  vehiclePlate?: string;
};

export type NotificationPreferences = {
  [key: string]: boolean;
  maintenance_upcoming: boolean;
  maintenance_overdue: boolean;
  verification_upcoming: boolean;
  incident_new: boolean;
  incident_status_update: boolean;
  document_expiry: boolean;
};

export type CatalogItem = {
  id: string;
  name: string; // Nombre del taller, marca, tipo de servicio
  // Fields specific to Workshops (Taller Mecánico)
  managerName?: string; // Nombre del encargado
  address?: string;     // Domicilio completo
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
};

export type ModelCatalogItem = {
  id: string;
  name: string;
  brandId: string; // ID of the brand this model belongs to
};

export type MaintenanceRule = {
  id: string;
  name: string;
  vehicleType?: string; // e.g., "Sedán", "Pickup", or a specific model group, or "Todos"
  assignedVehicleIds?: string[]; // For assigning to specific vehicles
  mileageInterval?: number;
  timeIntervalMonths?: number;
  serviceTasks: string; // Description of tasks or main service
  lastUpdated: string;
};

export type PredictiveMaintenanceResult = {
  predictedIssues: string;
  priority: string;
  recommendedActions: string;
};

export type PrioritizedMaintenanceIssue = {
  issue: string;
  priority: number;
  vehicleId?: string;
  vehiclePlate?: string;
  details?: string;
};

// For sidebar navigation
export type NavItem = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
  external?: boolean;
};

export type SidebarNavItem = NavItem & {
  subItems?: NavItem[];
  isCollapsible?: boolean;
};

// For KPI cards
export type KpiCardData = {
  title: string;
  value: string | number;
  description?: string;
  iconName: string; 
  actionLink?: string;
  actionText?: string;
  colorClass?: string; 
};

// For data tables
export interface DataTableColumn<TData> {
  accessorKey: keyof TData | string; 
  header: string;
  cell?: (props: { row: { original: TData } }) => React.ReactNode;
}

