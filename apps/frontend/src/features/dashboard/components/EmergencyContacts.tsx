import { Contact } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import type { EmergencyContact } from "../../../types/dashboard";
import { dummyContacts } from "../data/dummyData";
import { resolveContactIcon } from "../../emergency-contacts/utils/emergencyIconPresets";

type EmergencyContactsProps = {
  contacts: EmergencyContact[];
  isLoading?: boolean;
  isError?: boolean;
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
            const { Icon } = resolveContactIcon(
              contact.id ? String(contact.id) : undefined,
              contact.institution,
              contact.icon ?? undefined
            );

            const phone = contact.phone ?? contact.phoneNumber ?? "";
            const isNationalCenter = phone === "112" || contact.institution.toLowerCase().includes("call center");

            return (
              <a
                className={`text-base contact-card ${isNationalCenter ? "contact-card--danger" : ""}`}
                href={phone ? `tel:${phone}` : undefined}
                key={`${contact.institution}-${phone}`}
              >
                <Icon size={32} aria-hidden="true" />
                <strong>{contact.institution}</strong>
                <span className={`text-lg font-normal mt-1 ${
                  isNationalCenter ? "text-red-600" : "opacity-70"
                }`}>
                  {phone || "Nomor belum tersedia"}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
};