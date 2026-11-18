import { useState } from "react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { ESRI_API_KEY } from "./basemap";
import type { BaseMapMode } from "./BaseMapLayers";

/** Lapisan satelit tersedia bila API key Esri diisi saat build. */
export const SATELLITE_AVAILABLE = ESRI_API_KEY !== "";

/**
 * Mode peta yang dipilih pengguna dan mode yang benar-benar dipakai: citra satelit butuh
 * internet, jadi saat offline peta kembali ke peta jalan yang tersimpan.
 */
export const useBaseMapMode = () => {
  const [mapType, setMapType] = useState<BaseMapMode>("streets");
  const isOnline = useOnlineStatus();
  const effectiveMapType: BaseMapMode = SATELLITE_AVAILABLE && isOnline ? mapType : "streets";
  return { mapType: effectiveMapType, setMapType, isOnline };
};
