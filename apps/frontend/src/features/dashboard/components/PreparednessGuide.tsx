import { BookOpen } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { preparednessGuideData } from "../data/preparednessData";

export const PreparednessGuide = () => (
  <section aria-labelledby="preparedness" className="w-full">
    <SectionHeader id="preparedness" title="Panduan Kesiapsiagaan" icon={<BookOpen size={22} />} />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      {preparednessGuideData.map((guide) => (
        <article
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
          key={guide.title}
        >
          {/* Bagian Atas: Gambar Header & Poin Ringkasan */}
          <div>
            <div className="relative h-44 w-full overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src={guide.image}
                alt={guide.title}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                <h3 className="text-xl font-bold text-white tracking-wide">
                  {guide.title}
                </h3>
              </div>
            </div>

            {/* List Poin Panduan (1, 2) */}
            <div className="p-5 space-y-4">
              {guide.points.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bagian Bawah: Button Link sesuai komponen Evakuasi */}
          <div className="p-5 pt-0">
            <a 
              href={guide.href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full block"
            >
              <Button type="button" variant="secondary" className="w-full">
                {guide.buttonLabel}
              </Button>
            </a>
          </div>
        </article>
      ))}
    </div>
  </section>
);