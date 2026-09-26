import React, { useState } from "react";
import { Contact, Phone, PhoneCall, X } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import type { EmergencyContact } from "../../../types/dashboard";
import type { EmergencyContactRecord } from "../../../types/emergencyContact";
import { dummyContacts } from "../data/dummyData";
import { resolveContactIcon } from "../../emergency-contacts/utils/emergencyIconPresets";

type AnyEmergencyContact = EmergencyContact | EmergencyContactRecord;

type EmergencyContactsProps = {
  contacts: AnyEmergencyContact[];
  isLoading?: boolean;
  isError?: boolean;
};

export const EmergencyContacts: React.FC<EmergencyContactsProps> = ({
  contacts,
  isLoading = false,
  isError = false,
}) => {
  const [selectedContact, setSelectedContact] =
    useState<AnyEmergencyContact | null>(null);

  const displayContacts =
    isError || contacts.length === 0 ? dummyContacts : contacts;

  // Ekstrak info kontak yang sedang dipilih untuk modal konfirmasi
  const selectedPhone =
    selectedContact &&
    (("phoneNumber" in selectedContact && selectedContact.phoneNumber) ||
      ("phone" in selectedContact && selectedContact.phone) ||
      "");

  const selectedPreset = selectedContact
    ? resolveContactIcon(
        selectedContact.id ? String(selectedContact.id) : undefined,
        selectedContact.institution,
        selectedContact.icon ?? undefined
      )
    : null;

  return (
    <section aria-labelledby="contacts" className="w-full">
      <SectionHeader
        id="contacts"
        title="Kontak Darurat Desa"
        icon={<Contact size={22} />}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={`contact-skeleton-${idx}`}
              className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-xl sm:rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs animate-pulse"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                </div>
              </div>
              <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      ) : displayContacts.length === 0 ? (
        <div className="mt-4 p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-2">
          <Phone size={28} className="mx-auto text-slate-400" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Belum ada kontak darurat yang tersedia
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
          {displayContacts.map((contact, index) => {
            const phone =
              ("phoneNumber" in contact && contact.phoneNumber) ||
              ("phone" in contact && contact.phone) ||
              "";
            const idStr = contact.id ? String(contact.id) : `contact-${index}`;
            const contactKey = `${contact.institution}-${phone}-${idStr}`;

            const { Icon, boxClass } = resolveContactIcon(
              idStr,
              contact.institution,
              contact.icon ?? undefined
            );

            return (
              <button
                key={contactKey}
                type="button"
                onClick={() => setSelectedContact(contact)}
                className="w-full text-left group bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl sm:rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
                title={`Klik untuk memanggil ${contact.institution}`}
              >
                {/* Icon + Nama & Nomor */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${boxClass}`}
                  >
                    <Icon size={22} strokeWidth={2.2} />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-[#00247D] dark:group-hover:text-blue-400 transition-colors">
                      {contact.institution}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-mono">
                      {phone || "Nomor belum tersedia"}
                    </p>
                  </div>
                </div>

                {/* Ikon Telepon di Kanan */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-[#00247D] dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-colors shrink-0">
                  <Phone size={19} strokeWidth={2} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pop-up Dialog Validasi Panggilan Darurat */}
      {selectedContact && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedContact(null)}
        >
          <div
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Tutup Silang di Kanan Atas */}
            <button
              type="button"
              onClick={() => setSelectedContact(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Tutup"
            >
              <X size={18} />
            </button>

            {/* Icon Header */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-sm ${
                selectedPreset?.boxClass ?? "bg-blue-600 text-white"
              }`}
            >
              <PhoneCall size={26} strokeWidth={2.2} />
            </div>

            {/* Judul & Pertanyaan */}
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Panggilan Darurat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apakah Anda yakin ingin melakukan panggilan telepon ke instansi ini?
              </p>
            </div>

            {/* Box Rincian Instansi & Nomor */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {selectedContact.institution}
              </h4>
              <p className="font-mono text-xl font-black text-[#00247D] dark:text-blue-400 tracking-wide">
                {selectedPhone || "Nomor belum tersedia"}
              </p>
            </div>

            {/* Tombol Aksi: Batal vs Ya, Hubungi */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!selectedPhone}
                onClick={() => {
                  if (selectedPhone) {
                    window.location.href = `tel:${selectedPhone}`;
                    setSelectedContact(null);
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00247D] hover:bg-[#001b5e] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-900/20 transition active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <PhoneCall size={15} />
                <span>Ya, Hubungi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};