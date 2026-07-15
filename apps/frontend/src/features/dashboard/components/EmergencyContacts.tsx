import { Building2, Contact, Phone, Shield, Truck, UserRound } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { EmergencyContact } from "../../../types/dashboard";

type EmergencyContactsProps = {
  contacts: EmergencyContact[];
};

const icons = [UserRound, Shield, Building2, Truck, Contact, Phone];

export const EmergencyContacts = ({ contacts }: EmergencyContactsProps) => (
  <section aria-labelledby="contacts">
    <SectionHeader id="contacts" title="Kontak Darurat" icon={<Contact size={22} />} />
    {contacts.length > 0 ? (
      <div className="contact-grid">
        {contacts.map((contact, index) => {
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
    ) : (
      <StateMessage title="Kontak belum tersedia" message="Daftar kontak darurat belum dikirim oleh backend." />
    )}
  </section>
);
