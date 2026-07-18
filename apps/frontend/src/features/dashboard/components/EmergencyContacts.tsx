import { Building2, Contact, Phone, Shield, Truck, UserRound } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import type { EmergencyContact } from "../../../types/dashboard";
import { dummyContacts } from "../data/dummyData";

type EmergencyContactsProps = {
  contacts: EmergencyContact[];
  isLoading?: boolean;
  isError?: boolean;
};

const icons = [UserRound, Shield, Building2, Truck, Contact, Phone];

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
          {displayContacts.map((contact, index) => {
            const Icon = icons[index % icons.length];
            const phone = contact.phone ?? contact.phoneNumber ?? "";
            const isNationalCenter = phone === "112" || contact.institution.toLowerCase().includes("call center");

            return (
              <a
                className={`contact-card ${isNationalCenter ? "contact-card--danger" : ""}`}
                href={phone ? `tel:${phone}` : undefined}
                key={`${contact.institution}-${phone}`}
              >
                <Icon size={28} aria-hidden="true" />
                <strong>{contact.institution}</strong>
                <span>{phone || "Nomor belum tersedia"}</span>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
};
