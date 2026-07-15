import { BookOpen } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";

const guides = [
  {
    title: "Panduan Gempa Bumi",
    steps: ["Jangan panik, lindungi kepala.", "Menjauh dari kaca dan benda jatuh."],
  },
  {
    title: "Panduan Tsunami",
    steps: ["Jika gempa berlangsung lebih dari 20 detik, jauhi pantai.", "Menuju tempat tinggi minimal 20 meter."],
  },
];

export const PreparednessGuide = () => (
  <section aria-labelledby="preparedness">
    <SectionHeader id="preparedness" title="Panduan Kesiapsiagaan" icon={<BookOpen size={22} />} />
    <div className="guide-grid">
      {guides.map((guide) => (
        <article className="guide-card" key={guide.title}>
          <div className="guide-card__media">
            <h3>{guide.title}</h3>
          </div>
          <ol>
            {guide.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      ))}
    </div>
  </section>
);
