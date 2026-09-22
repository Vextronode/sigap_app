import React from "react";
import {
  ExternalLink,
  Sparkles,
  MapPin,
  ShieldCheck,
  Users,
  Navigation,
} from "lucide-react";
import type { EvacuationPoint } from "../../../types/dashboard";
import type { PointWithDistance } from "../hooks/useCitizenLocation";

interface CitizenEvacuationListProps {
  points: PointWithDistance[];
  nearestPointId?: string | null;
  selectedPointId?: string | null;
  onSelectPoint?: (point: EvacuationPoint) => void;
}

export const CitizenEvacuationList: React.FC<CitizenEvacuationListProps> = ({
  points,
  nearestPointId,
  selectedPointId,
  onSelectPoint,
}) => {
  const [expandedDescId, setExpandedDescId] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3 h-full overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
      {points.map((point, index) => {
        const isNearest = nearestPointId === point.id;
        const isSelected = selectedPointId === point.id;
        const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}&travelmode=walking`;

        return (
          <article
            key={point.id}
            onClick={() => onSelectPoint?.(point)}
            className={`group relative bg-white dark:bg-slate-900 border rounded-xl p-3 sm:p-3.5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between text-left cursor-pointer ${
              isSelected
                ? "border-blue-500 ring-2 ring-blue-500/30 dark:ring-blue-500/40"
                : isNearest
                ? "border-amber-400 dark:border-amber-600 bg-amber-50/20 dark:bg-amber-950/10"
                : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div>
              {/* Header Kartu: Nomor + Nama Titik & Badge Shelter Utama / Terdekat */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#00247D] dark:group-hover:text-blue-400 transition-colors truncate">
                      {point.name}
                    </h3>
                    {point.address && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin size={11} className="shrink-0 text-slate-400" />
                        <span className="truncate">{point.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {point.isCore && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#00247D] dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 uppercase tracking-wide">
                      <ShieldCheck size={10} />
                      Shelter Utama
                    </span>
                  )}
                  {isNearest && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
                      <Sparkles size={10} />
                      Terdekat
                    </span>
                  )}
                </div>
              </div>

              {/* Kotak Metrik: Daya Tampung & Estimasi Jarak (Elevasi Aman Dihapus) */}
              <div className={`grid ${point.distanceLabel ? "grid-cols-2" : "grid-cols-1"} gap-2 mt-2`}>
                {/* Kotak Daya Tampung */}
                <div className="p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <Users size={13} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[9px] font-bold uppercase text-blue-800 dark:text-blue-300 tracking-wider truncate">
                      Daya Tampung
                    </span>
                    <strong className="block text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white truncate">
                      {point.capacity !== undefined && point.capacity !== null ? `±${point.capacity.toLocaleString("id-ID")} jiwa` : "-"}
                    </strong>
                  </div>
                </div>

                {/* Kotak Estimasi Jarak GPS (jika GPS aktif) */}
                {point.distanceLabel ? (
                  <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                      <Navigation size={12} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[9px] font-bold uppercase text-amber-800 dark:text-amber-300 tracking-wider truncate">
                        Estimasi Jarak
                      </span>
                      <strong className="block text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white truncate">
                        ±{point.distanceLabel}
                      </strong>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Catatan Rute & Akses - expand/collapse elegan */}
              {point.description && (() => {
                const isExpanded = expandedDescId === point.id;
                const isLong = point.description.length > 120;
                return (
                  <div className="mt-2">
                    <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                      Catatan Rute &amp; Akses :
                    </span>
                    <div className="relative">
                      <p
                        className={`text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 ${
                          isLong && !isExpanded ? "line-clamp-2" : ""
                        }`}
                      >
                        {point.description}
                      </p>
                      {/* Gradient fade-out hanya ketika teks panjang & belum di-expand */}
                      {isLong && !isExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-slate-50 dark:from-slate-800/50 to-transparent rounded-b-lg pointer-events-none" />
                      )}
                    </div>
                    {isLong && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDescId(isExpanded ? null : point.id);
                        }}
                        className="mt-0.5 flex items-center gap-0.5 w-full justify-end"
                      >
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {isExpanded ? "Sembunyikan" : "Lihat selengkapnya"}
                        </span>
                        <span className="text-[11px] font-bold text-blue-500 dark:text-blue-400 leading-none">
                          {isExpanded ? "↑" : "↓"}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Fasilitas Chips */}
              {point.facilities && point.facilities.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {point.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="text-[9px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tombol Rute Google Maps dengan efek hover panah */}
            <div className="mt-3 pt-0.5">
              <a
                href={googleMapsDirUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="group/btn inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-[#00247D] hover:bg-[#001D66] text-white text-xs font-bold shadow-2xs hover:shadow transition-all cursor-pointer"
                style={{ color: "#ffffff", textDecoration: "none" }}
              >
                <span style={{ color: "#ffffff", fontWeight: 700 }}>Rute Google Maps</span>
                <ExternalLink
                  size={12}
                  className="text-white shrink-0 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
                  style={{ color: "#ffffff" }}
                />
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
};
