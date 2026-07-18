import { BookOpen } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { dummyPreparednessGuide } from "../data/dummyData";

export const PreparednessGuide = () => (
  <section aria-labelledby="preparedness">
    <SectionHeader id="preparedness" title="Panduan Kesiapsiagaan" icon={<BookOpen size={22} />} />
    <div className="guide-grid">
      {dummyPreparednessGuide.map((guide) => (
        <article className="guide-card" key={guide.title}>
          <img className="guide-card__image" src={guide.image} alt={guide.title} loading="lazy" />
          <div className="guide-card__body">
            <h3>{guide.title}</h3>
            <p>{guide.description}</p>
            <Button type="button" variant="secondary" disabled>
              {guide.buttonLabel}
            </Button>
          </div>
        </article>
      ))}
    </div>
  </section>
);
