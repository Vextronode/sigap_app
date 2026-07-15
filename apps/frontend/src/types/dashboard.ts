export type AlertLevel = "NORMAL" | "AMAN" | "WASPADA" | "SIAGA" | "AWAS";

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type CurrentWeather = {
  temperature: number;
  humidity: number;
  weather: string;
  windSpeed: number;
  windDirection: string;
  visibility?: string;
  updatedAt: string;
};

export type WeatherForecastItem = {
  date: string;
  condition: string;
  temperature: number;
  rainProbability: number;
};

export type Earthquake = {
  magnitude: number;
  depth: string;
  location: string;
  coordinates?: Coordinates;
  distanceToVillage: number;
  felt?: string;
  potential: string;
  shakemap?: string;
  updatedAt: string;
};

export type TsunamiStatus = {
  status: string;
  warningLevel: string;
  source: string;
  updatedAt: string;
  waveHeight?: number;
  safeLimit?: number;
};

export type CurrentAlert = {
  level: AlertLevel;
  color: string;
  reason: string;
  generatedBy: string;
  validated: boolean;
  lastUpdated: string;
};

export type AiSummary = {
  summary: string;
};

export type Announcement = {
  id: string | number;
  title: string;
  content?: string;
  publishedAt: string;
  priority: PriorityLevel;
};

export type EmergencyContact = {
  id?: string | number;
  institution: string;
  contactPerson?: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
};

export type GeoJsonLineString = {
  type: "LineString";
  coordinates: [number, number][];
};

export type GeoJsonFeature = {
  type: "Feature";
  geometry?: GeoJsonLineString;
  properties?: Record<string, unknown>;
};

export type EvacuationPoint = {
  id: string | number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  capacity?: number;
  address?: string;
};

export type EvacuationRoute = {
  id: string | number;
  routeName?: string;
  name?: string;
  description?: string;
  geometry: unknown;
  distanceMeters?: number;
  estimatedMinutes?: number;
  destinationPointId?: string | number;
};

export type DashboardData = {
  weather: CurrentWeather | null;
  forecast: WeatherForecastItem[];
  earthquake: Earthquake | null;
  tsunami: TsunamiStatus | null;
  alert: CurrentAlert | null;
  summary: AiSummary | null;
  announcement: Announcement[];
  contacts: EmergencyContact[];
  evacuation: EvacuationPoint[];
  evacuationRoutes?: EvacuationRoute[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};
