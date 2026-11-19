import { useCallback, useState } from "react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { ESRI_API_KEY } from "./basemap";
import type { BaseMapMode } from "./BaseMapLayers";

/** Lapisan satelit tersedia bila API key Esri diisi saat build. */
export const SATELLITE_AVAILABLE = ESRI_API_KEY !== "";

/**
 * Mode peta yang dipilih pengguna dan mode yang benar-benar dipakai. Citra satelit butuh
 * internet: saat offline, atau saat tile satelit gagal dimuat (sinyal lemah, kuota habis,
 * key dicabut), peta kembali ke peta jalan. Status gagal dipulihkan saat koneksi kembali.
 */
export const useBaseMapMode = () => {
  const [mapType, setMapType] = useState<BaseMapMode>("streets");
  const [failedWhileOnline, setFailedWhileOnline] = useState(false);
  const isOnline = useOnlineStatus();
  // Gagal yang tercatat hanya berlaku selama sesi online yang sama; saat offline lalu online
  // kembali, satelit boleh dicoba lagi.
  const [onlineSession, setOnlineSession] = useState(isOnline);
  if (onlineSession !== isOnline) {
    setOnlineSession(isOnline);
    if (isOnline) setFailedWhileOnline(false);
  }

  const satelliteUsable = SATELLITE_AVAILABLE && isOnline && !failedWhileOnline;
  const effectiveMapType: BaseMapMode = satelliteUsable ? mapType : "streets";
  const onSatelliteError = useCallback(() => setFailedWhileOnline(true), []);

  return {
    mapType: effectiveMapType,
    setMapType,
    isOnline,
    satelliteUsable,
    onSatelliteError,
  };
};

/** Keterangan tombol Satelit sesuai ketersediaannya. */
export const satelliteTitle = (isOnline: boolean, satelliteUsable: boolean) =>
  satelliteUsable
    ? "Tampilan Citra Satelit"
    : isOnline
      ? "Citra satelit sedang tidak dapat dimuat"
      : "Citra satelit tidak tersedia saat offline";
