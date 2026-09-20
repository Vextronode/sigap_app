import React, { useState, useMemo } from "react";
import { X, MapPin, Loader2, Info, Plus } from "lucide-react";
import type { EvacuationPoint } from "../../../../types/dashboard";
import type { EvacuationPointPayload } from "../../../../services/evacuationService";
import { EvacuationLocationPicker } from "../EvacuationLocationPicker";
import { CIBENDA_CENTER } from "../../../../utils/map";

interface EvacuationPointFormModalProps {
  isOpen: boolean;
  point: EvacuationPoint | null;
  onClose: () => void;
  onSubmit: (payload: EvacuationPointPayload) => Promise<void>;
  isSubmitting?: boolean;
}

const COMMON_FACILITIES = [
  "Air Bersih",
  "Tenda Darurat",
  "Logistik / Dapur Umum",
  "Tenaga Medis",
  "Listrik / Genset",
  "Jalur Ambulans",
  "Area Terbuka Gempa",
  "Dataran Tinggi Anti-Tsunami",
  "Konstruksi Tahan Gempa",
  "Sistem Sirine Tsunami",
];

export const EvacuationPointFormModal: React.FC<EvacuationPointFormModalProps> = (
  props
) => {
  if (!props.isOpen) return null;

  return (
    <EvacuationPointFormModalContent
      key={props.point?.id ?? "create-new-point"}
      {...props}
    />
  );
};

const EvacuationPointFormModalContent: React.FC<EvacuationPointFormModalProps> = ({
  point,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const isEdit = !!point;

  const [name, setName] = useState(point?.name ?? "");
  const [address, setAddress] = useState(point?.address ?? "");
  const [latitude, setLatitude] = useState<number>(point?.latitude ?? CIBENDA_CENTER[0]);
  const [longitude, setLongitude] = useState<number>(point?.longitude ?? CIBENDA_CENTER[1]);
  const [elevation, setElevation] = useState<string>(
    point?.elevation !== undefined && point?.elevation !== null ? String(point.elevation) : ""
  );
  const [capacity, setCapacity] = useState<string>(
    point?.capacity !== undefined && point?.capacity !== null ? String(point.capacity) : ""
  );
  const [description, setDescription] = useState(point?.description ?? "");
  const [facilities, setFacilities] = useState<string[]>(point?.facilities ?? []);
  const [isCore, setIsCore] = useState<boolean>(point?.isCore ?? false);
  const [customFacilityInput, setCustomFacilityInput] = useState("");
  const [localCustomFacilities, setLocalCustomFacilities] = useState<string[]>([]);

  // Daftar fasilitas untuk titik ini: bawaan + fasilitas eksisting titik ini + fasilitas kustom lokal sesi ini
  const availableFacilities = useMemo(() => {
    const list = [...COMMON_FACILITIES];
    if (point?.facilities) {
      point.facilities.forEach((f) => {
        if (!list.includes(f)) list.push(f);
      });
    }
    localCustomFacilities.forEach((f) => {
      if (!list.includes(f)) list.push(f);
    });
    return list;
  }, [point?.facilities, localCustomFacilities]);

  const [errors, setErrors] = useState<{
    name?: string;
    latitude?: string;
    longitude?: string;
    elevation?: string;
    capacity?: string;
  }>({});

  const handleLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
  };

  const toggleFacility = (facility: string) => {
    setFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  const handleAddCustomFacility = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customFacilityInput.trim();
    if (trimmed) {
      if (!localCustomFacilities.includes(trimmed)) {
        setLocalCustomFacilities((prev) => [...prev, trimmed]);
      }
      if (!facilities.includes(trimmed)) {
        setFacilities((prev) => [...prev, trimmed]);
      }
      setCustomFacilityInput("");
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Nama titik evakuasi wajib diisi.";
    } else if (name.trim().length < 3) {
      newErrors.name = "Nama titik evakuasi minimal 3 karakter.";
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      newErrors.latitude = "Latitude harus valid antara -90 dan 90.";
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      newErrors.longitude = "Longitude harus valid antara -180 dan 180.";
    }

    if (elevation.trim() !== "" && isNaN(Number(elevation))) {
      newErrors.elevation = "Elevasi harus berupa angka mdpl.";
    }

    if (capacity.trim() !== "" && (isNaN(Number(capacity)) || Number(capacity) < 0)) {
      newErrors.capacity = "Kapasitas harus berupa angka positif.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    await onSubmit({
      name: name.trim(),
      address: address.trim() || null,
      latitude,
      longitude,
      elevation: elevation.trim() !== "" ? Number(elevation) : null,
      capacity: capacity.trim() !== "" ? Number(capacity) : null,
      description: description.trim() || null,
      facilities,
      isCore,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#00247D] dark:text-blue-300 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isEdit ? "Edit Titik Evakuasi" : "Tambah Titik Evakuasi Baru"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Peta interaktif & metadata shelter evakuasi Desa Cibenda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Peta Pin-Drop Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tentukan Titik di Peta (Interactive Pin-Drop) *
            </label>
            <EvacuationLocationPicker
              latitude={latitude}
              longitude={longitude}
              onChange={handleLocationChange}
              isCore={isCore}
            />
          </div>

          {/* Input Koordinat Manual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Latitude (Garis Lintang) *
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setLatitude(val);
                }}
                className={`w-full px-3 py-2 text-xs font-mono rounded-xl border bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                  errors.latitude
                    ? "border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:ring-[#00247D]/20 dark:focus:ring-blue-500/30"
                }`}
                placeholder="-7.678957"
              />
              {errors.latitude && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.latitude}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Longitude (Garis Bujur) *
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setLongitude(val);
                }}
                className={`w-full px-3 py-2 text-xs font-mono rounded-xl border bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                  errors.longitude
                    ? "border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:ring-[#00247D]/20 dark:focus:ring-blue-500/30"
                }`}
                placeholder="108.549459"
              />
              {errors.longitude && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.longitude}</p>
              )}
            </div>
          </div>

          {/* Nama Shelter & Alamat */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Titik / Tempat Evakuasi *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                  errors.name
                    ? "border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:ring-[#00247D]/20 dark:focus:ring-blue-500/30"
                }`}
                placeholder="Contoh: Kantor Pemerintahan Desa Cibenda, SDN 1 Cibenda"
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Alamat / Lokasi Dusun
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#00247D]/20 dark:focus:ring-blue-500/30"
                placeholder="Contoh: Jl. Raya Cijulang, Dusun Cikubang RT 02 / RW 01"
              />
            </div>
          </div>

          {/* Elevasi & Kapasitas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ketinggian / Elevasi (mdpl)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={elevation}
                  onChange={(e) => {
                    setElevation(e.target.value);
                    if (errors.elevation) setErrors((prev) => ({ ...prev, elevation: undefined }));
                  }}
                  className={`w-full pl-3.5 pr-14 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                    errors.elevation
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:ring-[#00247D]/20 dark:focus:ring-blue-500/30"
                  }`}
                  placeholder="Contoh: 25"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  mdpl
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Info size={11} className="text-blue-500 shrink-0" />
                <span>Zona aman tsunami umumnya di atas 20 mdpl.</span>
              </p>
              {errors.elevation && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.elevation}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kapasitas Daya Tampung
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={capacity}
                  onChange={(e) => {
                    setCapacity(e.target.value);
                    if (errors.capacity) setErrors((prev) => ({ ...prev, capacity: undefined }));
                  }}
                  className={`w-full pl-3.5 pr-14 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                    errors.capacity
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:ring-[#00247D]/20 dark:focus:ring-blue-500/30"
                  }`}
                  placeholder="Contoh: 500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  Jiwa
                </span>
              </div>
              {errors.capacity && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.capacity}</p>
              )}
            </div>
          </div>

          {/* Fasilitas Kesiapsiagaan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Fasilitas Kesiapsiagaan di Titik Ini
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {availableFacilities.map((facility) => {
                const isSelected = facilities.includes(facility);
                return (
                  <button
                    key={facility}
                    type="button"
                    onClick={() => toggleFacility(facility)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#00247D] dark:bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {facility}
                  </button>
                );
              })}
            </div>

            {/* Tambah Fasilitas Kustom */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customFacilityInput}
                onChange={(e) => setCustomFacilityInput(e.target.value)}
                placeholder="Tambah fasilitas kustom lain..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomFacility(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomFacility}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                Tambah
              </button>
            </div>
          </div>

          {/* Deskripsi & Panduan Akses */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Akses Jalan / Instruksi Singkat
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                backgroundColor: "#f8fafc",
                color: "#0f172a",
                fontFamily: "var(--font-sans, inherit)",
              }}
              className="w-full px-3.5 py-2.5 font-sans text-xs sm:text-sm font-normal rounded-xl border border-slate-200 dark:border-slate-700 !bg-[#f8fafc] dark:!bg-slate-800/60 !text-slate-900 dark:!text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#00247D]/20 dark:focus:ring-blue-500/30 min-h-[105px] resize-y leading-relaxed transition-colors"
              placeholder="Contoh: Akses jalan dapat dilalui kendaraan roda empat dan ambulans via Jl. Raya Cijulang."
            />
          </div>

          {/* Checkbox Titik Utama */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isCore"
              checked={isCore}
              onChange={(e) => setIsCore(e.target.checked)}
              className="w-4 h-4 rounded-sm text-[#00247D] focus:ring-[#00247D] border-slate-300 dark:border-slate-600 cursor-pointer"
            />
            <label
              htmlFor="isCore"
              className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer select-none"
            >
              Jadikan sebagai Titik Evakuasi Utama Desa (Core Shelter)
            </label>
          </div>
        </form>

        {/* Footer Aksi */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#00247D] hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Simpan Perubahan" : "Simpan Titik Evakuasi"}
          </button>
        </div>
      </div>
    </div>
  );
};
