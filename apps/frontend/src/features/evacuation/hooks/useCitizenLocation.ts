import { useState, useCallback, useMemo } from "react";
import type { EvacuationPoint } from "../../../types/dashboard";

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export interface PointWithDistance extends EvacuationPoint {
  distanceKm?: number;
  distanceLabel?: string;
}

// Rumus Haversine untuk menghitung jarak lurus dua koordinat (dalam kilometer)
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius bumi dalam KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

export const useCitizenLocation = (points: EvacuationPoint[] = []) => {
  const [userCoords, setUserCoords] = useState<UserCoordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Browser tidak mendukung geolokasi GPS.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        let msg = "Tidak dapat mendeteksi lokasi saat ini.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Akses lokasi ditolak di browser Anda.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Sinyal GPS / posisi tidak tersedia.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Waktu permintaan lokasi habis.";
        }
        setLocationError(msg);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Hitung jarak dan urutkan titik
  const sortedPoints = useMemo<PointWithDistance[]>(() => {
    if (!userCoords) {
      // Urutan default: titik inti (isCore) lebih dulu, lalu nama
      return [...points].sort((a, b) => {
        if (a.isCore && !b.isCore) return -1;
        if (!a.isCore && b.isCore) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    // Jika GPS aktif, hitung jarak dan urutkan dari yang terdekat
    const withDistance = points.map((point) => {
      const distanceKm = calculateHaversineDistanceKm(
        userCoords.latitude,
        userCoords.longitude,
        point.latitude,
        point.longitude
      );
      return {
        ...point,
        distanceKm,
        distanceLabel: formatDistance(distanceKm),
      };
    });

    return withDistance.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }, [points, userCoords]);

  // ID titik yang paling dekat dengan warga
  const nearestPointId = useMemo<string | null>(() => {
    if (!userCoords || sortedPoints.length === 0) return null;
    return sortedPoints[0]?.id ?? null;
  }, [userCoords, sortedPoints]);

  return {
    userCoords,
    isLocating,
    locationError,
    requestLocation,
    sortedPoints,
    nearestPointId,
  };
};
