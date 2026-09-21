import React, { useState } from "react";
import { Map, AlertTriangle, ShieldCheck, Navigation, Loader2 } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import type { EvacuationPoint, EvacuationRoute } from "../../../types/dashboard";
import { useCitizenLocation } from "../../evacuation/hooks/useCitizenLocation";
import { CitizenEvacuationMap } from "../../evacuation/components/CitizenEvacuationMap";
import { CitizenEvacuationList } from "../../evacuation/components/CitizenEvacuationList";

type EvacuationRoutesProps = {
  points: EvacuationPoint[];
  routes?: EvacuationRoute[];
  isPointsLoading?: boolean;
  isRoutesLoading?: boolean;
  isPointsError?: boolean;
  isRoutesError?: boolean;
};

export const EvacuationRoutes: React.FC<EvacuationRoutesProps> = ({
  points,
  isPointsLoading = false,
  isPointsError = false,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<EvacuationPoint | null>(null);

  const {
    userCoords,
    isLocating,
    locationError,
    requestLocation,
    sortedPoints,
    nearestPointId,
  } = useCitizenLocation(points);

  const isEmpty = !isPointsLoading && points.length === 0;

  return (
    <section aria-labelledby="evacuation" className="space-y-4">
      <SectionHeader
        id="evacuation"
        title="Jalur & Titik Evakuasi Bencana"
        icon={<Map size={22} />}
      />

      {isPointsLoading ? (
        <div className="space-y-4">
          <div className="h-[400px] w-full rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      ) : isPointsError && points.length === 0 ? (
        <Card className="p-8 text-center bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Gagal Memuat Titik Evakuasi
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Terjadi kendala jaringan saat mengambil data titik kumpul. Silakan periksa koneksi internet Anda atau hubungi pihak desa.
          </p>
        </Card>
      ) : isEmpty ? (
        <Card className="p-8 text-center bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Map size={24} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Belum Ada Titik Evakuasi Terdaftar
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pemerintah Desa Cibenda belum mempublikasikan titik kumpul evakuasi resmi.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* 1. Header Toolbar: Kotak Daftar Shelter & Titik Kumpul Aman (di atas Map) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#00247D] dark:text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">
                  Daftar Shelter & Titik Kumpul Aman
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Informasi aksesibilitas resmi warga Desa Cibenda & sekitarnya
                </p>
              </div>
            </div>

            {/* Tombol GPS Titik Terdekat */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={requestLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-75 cursor-pointer"
              >
                {isLocating ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Mendeteksi GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation size={13} />
                    <span>{userCoords ? "Perbarui Lokasi (GPS)" : "Cari Titik Terdekat (GPS)"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Alert Error GPS (jika ada) */}
          {locationError && (
            <div className="text-xs px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 flex items-center gap-2 animate-fade-in">
              <AlertTriangle size={14} className="shrink-0 text-amber-600" />
              <span>{locationError}</span>
            </div>
          )}

          {/* Layout Berdampingan (Side-by-Side): Map Lebih Lebar di Kiri, List Ringkas di Kanan */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
            {/* Sisi Kiri: Map Evakuasi Interaktif (Ukuran Diperlebar ke Kanan) */}
            <div className="lg:col-span-6 xl:col-span-6 w-full h-[360px] sm:h-[420px] lg:h-[480px]">
              <CitizenEvacuationMap
                points={sortedPoints}
                userCoords={userCoords}
                nearestPointId={nearestPointId}
                selectedPointId={selectedPoint?.id}
                onSelectPoint={setSelectedPoint}
                heightClass="h-full"
              />
            </div>

            {/* Sisi Kanan: Kotak List Lokasi Evakuasi Kompak & Proporsional */}
            <div className="lg:col-span-6 xl:col-span-6 w-full h-[360px] sm:h-[420px] lg:h-[480px]">
              <CitizenEvacuationList
                points={sortedPoints}
                nearestPointId={nearestPointId}
                selectedPointId={selectedPoint?.id}
                onSelectPoint={setSelectedPoint}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};