import { Layers, Map as MapIcon } from "lucide-react";
import type { BaseMapMode } from "./BaseMapLayers";
import { SATELLITE_AVAILABLE } from "./useBaseMapMode";

interface MapTypeToggleProps {
  value: BaseMapMode;
  onChange: (mode: BaseMapMode) => void;
  isOnline: boolean;
}

const buttonClass = (active: boolean) =>
  `px-1.5 py-0.5 rounded-md text-[9.5px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
    active
      ? "bg-sigap-primary text-white shadow-xs"
      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
  }`;

/** Tombol Jalan/Satelit di pojok kanan atas peta; tidak tampil bila satelit tidak tersedia. */
export const MapTypeToggle = ({ value, onChange, isOnline }: MapTypeToggleProps) => {
  if (!SATELLITE_AVAILABLE) return null;

  return (
    <div className="absolute top-2 right-2 z-1000 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-0.5 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-0.5 select-none pointer-events-auto">
      <button
        type="button"
        onClick={() => onChange("streets")}
        className={buttonClass(value === "streets")}
        title="Tampilan Peta Jalan"
      >
        <MapIcon size={10} />
        <span>Jalan</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("satellite")}
        disabled={!isOnline}
        className={buttonClass(value === "satellite")}
        title={isOnline ? "Tampilan Citra Satelit" : "Citra satelit tidak tersedia saat offline"}
      >
        <Layers size={10} />
        <span>Satelit</span>
      </button>
    </div>
  );
};
