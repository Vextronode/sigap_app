import type { EvacuationRoute, GeoJsonFeature, GeoJsonLineString } from "../types/dashboard";

export const CIBENDA_CENTER: [number, number] = [-7.67472, 108.55444];

const isCoordinatePair = (value: unknown): value is [number, number] =>
  Array.isArray(value) &&
  value.length >= 2 &&
  typeof value[0] === "number" &&
  typeof value[1] === "number";

const isLineString = (value: unknown): value is GeoJsonLineString => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GeoJsonLineString>;
  return candidate.type === "LineString" && Array.isArray(candidate.coordinates);
};

const isFeature = (value: unknown): value is GeoJsonFeature => {
  if (!value || typeof value !== "object") return false;
  return (value as Partial<GeoJsonFeature>).type === "Feature";
};

export const routeToLatLngs = (route: EvacuationRoute): [number, number][] => {
  const geometry = isFeature(route.geometry) ? route.geometry.geometry : route.geometry;
  if (!isLineString(geometry)) return [];

  return geometry.coordinates
    .filter(isCoordinatePair)
    .map(([longitude, latitude]) => [latitude, longitude]);
};
