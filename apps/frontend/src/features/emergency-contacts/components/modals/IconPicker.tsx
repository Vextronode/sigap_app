import React, { useState } from "react";
import { Check } from "lucide-react";
import {
  EMERGENCY_ICON_PRESETS,
  type EmergencyIconKey,
  type IconPreset,
} from "../../utils/emergencyIconPresets";

interface IconPickerProps {
  selectedKey: EmergencyIconKey;
  onChange: (key: EmergencyIconKey) => void;
}

type CategoryFilter = "Semua" | "Medis" | "Keamanan" | "Bencana" | "Layanan";

export const IconPicker: React.FC<IconPickerProps> = ({
  selectedKey,
  onChange,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("Semua");

  const categories: CategoryFilter[] = [
    "Semua",
    "Medis",
    "Keamanan",
    "Bencana",
    "Layanan",
  ];

  const filteredPresets =
    activeCategory === "Semua"
      ? EMERGENCY_ICON_PRESETS
      : EMERGENCY_ICON_PRESETS.filter((p) => p.category === activeCategory);

  const currentPreset =
    EMERGENCY_ICON_PRESETS.find((p) => p.key === selectedKey) ||
    EMERGENCY_ICON_PRESETS[0];

  const CurrentIcon = currentPreset.Icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
          Pilih Ikon Kontak <span className="text-slate-400 font-normal">(Non-upload)</span>
        </label>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Pilihan Vektor Lucide
        </span>
      </div>

      {/* Live Preview Box */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${currentPreset.boxClass}`}
        >
          <CurrentIcon size={22} strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              {currentPreset.label}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${currentPreset.badgeClass}`}
            >
              {currentPreset.category}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Tampilan icon ini akan langsung muncul pada kartu kontak darurat.
          </p>
        </div>
      </div>

      {/* Filter Kategori */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === cat
                ? "bg-[#00247D] text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Pilihan Icon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 border border-slate-100 dark:border-slate-800/80 rounded-xl p-2 bg-white dark:bg-slate-900/50">
        {filteredPresets.map((preset: IconPreset) => {
          const isSelected = preset.key === selectedKey;
          const PresetIcon = preset.Icon;

          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => onChange(preset.key)}
              className={`group flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer relative ${
                isSelected
                  ? "border-[#00247D] bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-[#00247D] dark:ring-blue-500"
                  : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
              title={preset.label}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${preset.boxClass}`}
              >
                <PresetIcon size={15} strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-[#00247D] dark:group-hover:text-blue-400">
                  {preset.label.split("/")[0].trim()}
                </p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500">
                  {preset.category}
                </p>
              </div>

              {isSelected && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#00247D] text-white flex items-center justify-center text-[10px]">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
