import React from "react";
import {
  MapPin,
  Mountain,
  Users,
  ShieldCheck,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
} from "lucide-react";
import type { EvacuationPoint } from "../../../types/dashboard";

interface EvacuationPointCardsProps {
  points: EvacuationPoint[];
  isLoading?: boolean;
  onEdit: (point: EvacuationPoint) => void;
  onDelete: (point: EvacuationPoint) => void;
  onHighlightMap?: (point: EvacuationPoint) => void;
}

export const EvacuationPointCards: React.FC<EvacuationPointCardsProps> = ({
  points,
  isLoading = false,
  onEdit,
  onDelete,
  onHighlightMap,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"
          />
        ))}
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Belum ada titik evakuasi yang didaftarkan.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {points.map((point) => {
        const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}&travelmode=walking`;
        const isSafeTsunami = (point.elevation ?? 0) >= 20;

        return (
          <div
            key={point.id}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between text-left"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {point.isCore ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#00247D] dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                      <ShieldCheck size={12} />
                      Shelter Utama
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Titik Kumpul Tambahan
                    </span>
                  )}

                  {point.elevation !== undefined && point.elevation !== null && (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        isSafeTsunami
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40"
                      }`}
                      title={
                        isSafeTsunami
                          ? "Elevasi aman dari ancaman gelombang tsunami"
                          : "Elevasi rendah, cocok untuk evakuasi darurat gempa non-tsunami"
                      }
                    >
                      <Mountain size={12} />
                      {point.elevation} mdpl
                    </span>
                  )}
                </div>

                {point.capacity !== undefined && point.capacity !== null && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <Users size={13} className="text-slate-400" />
                    {point.capacity.toLocaleString()} Jiwa
                  </span>
                )}
              </div>

              {/* Title & Address */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#00247D] dark:group-hover:text-blue-400 transition-colors">
                {point.name}
              </h3>

              {point.address && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1">
                  <MapPin size={13} className="shrink-0 mt-0.5 text-slate-400" />
                  <span>{point.address}</span>
                </p>
              )}

              {/* Description / Akses - Otomatis mengembang mengikuti panjang teks */}
              {point.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed whitespace-pre-line break-words bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {point.description}
                </p>
              )}

              {/* Fasilitas Chips */}
              {point.facilities && point.facilities.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {point.facilities.map((facility) => (
                      <span
                        key={facility}
                        className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
              <a
                href={googleMapsDirUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                <span>Rute Google Maps</span>
                <ExternalLink size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
              </a>

              <div className="flex items-center gap-1">
                {onHighlightMap && (
                  <button
                    type="button"
                    onClick={() => onHighlightMap(point)}
                    title="Sorot di Peta"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#00247D] hover:bg-blue-50 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <Layers size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onEdit(point)}
                  title="Edit Titik"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(point)}
                  title={point.isCore ? "Titik utama dilindungi" : "Hapus Titik"}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    point.isCore
                      ? "text-slate-300 dark:text-slate-600 hover:bg-transparent"
                      : "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                  }`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
