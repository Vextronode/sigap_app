import { Building2, Contact, Phone, Shield, Ambulance, Hospital, Landmark, Siren } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import type { EmergencyContact } from "../../../types/dashboard";
import { dummyContacts } from "../data/dummyData";

type EmergencyContactsProps = {
  contacts: EmergencyContact[];
  isLoading?: boolean;
  isError?: boolean;
};

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "ambulans": Ambulance,
  "pemadam": Siren,
  "polisi": Shield,
  "puskesmas": Hospital,
  "bpbd": Building2,
  "kepala desa": Landmark,
};

export const EmergencyContacts = ({ contacts, isLoading = false, isError = false }: EmergencyContactsProps) => {
  const displayContacts = isError || contacts.length === 0 ? dummyContacts : contacts;

  return (
    <section aria-labelledby="contacts">
      <SectionHeader id="contacts" title="Kontak Darurat" icon={<Contact size={22} />} />
      {isLoading ? (
        <div className="contact-grid">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="contact-grid">
          {displayContacts.map((contact) => {
            const lowerInst = contact.institution.toLowerCase();
            const matchedKey = Object.keys(iconMap).find(key => lowerInst.includes(key));
            const Icon = matchedKey ? iconMap[matchedKey] : Phone;

            const phone = contact.phone ?? contact.phoneNumber ?? "";
            const isNationalCenter = phone === "112" || lowerInst.includes("call center");

            return (
              <a
                className={`text-base contact-card ${isNationalCenter ? "contact-card--danger" : ""}`}
                href={phone ? `tel:${phone}` : undefined}
                key={`${contact.institution}-${phone}`}
              >
                <Icon size={32} aria-hidden="true" />
                <strong>{contact.institution}</strong>
                <span className={`text-lg font-normal mt-1 
                  ${isNationalCenter ? "text-red-200" : "text-slate-400"}`}
                >{phone || "Nomor belum tersedia"}</span>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
};