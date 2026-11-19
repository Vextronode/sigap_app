import type { EmergencyContact } from "../../../types/dashboard";

export const dummyContacts: EmergencyContact[] = [
  { id: "dummy-1", institution: "Ambulans / PSC 119 Pangandaran", phoneNumber: "119", isCore: true, icon: "ambulance" },
  { id: "dummy-2", institution: "Pemadam Kebakaran (Damkar) Pangandaran", phoneNumber: "0265-639113", isCore: true, icon: "damkar" },
  { id: "dummy-3", institution: "Kepolisian (Polsek Parigi)", phoneNumber: "0265-639110", isCore: true, icon: "polisi" },
  { id: "dummy-4", institution: "Puskesmas Parigi", phoneNumber: "0265-639345", isCore: false, icon: "puskesmas" },
  { id: "dummy-5", institution: "BPBD Kabupaten Pangandaran", phoneNumber: "0265-639733", isCore: false, icon: "bpbd" },
  { id: "dummy-6", institution: "Kantor Pemerintah Desa Cibenda", phoneNumber: "0812-2345-6789", isCore: false, icon: "desa" },
];
