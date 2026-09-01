export const Footer = () => (
  <footer className="w-full mt-12 pt-8 pb-6 border-t border-[color:var(--border)] flex flex-col items-center text-center">
    
    <div className="flex items-center gap-2 mb-3">
      <strong className="text-2xl font-bold tracking-wider uppercase">
        SIGAP DESA CIBENDA
      </strong>
    </div>

    <p className="text-xs opacity-75 max-w-xl leading-relaxed px-4 mb-4">
      © 2026 Pemerintah Desa Cibenda. Data kedaruratan diintegrasikan secara langsung bersumber dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) sebagai sumber data.
    </p>

    <div className="flex items-center gap-5 mb-6 text-xs font-medium opacity-80">
      <a href="/#privacy" className="hover:text-blue-600 transition-colors">Kebijakan Privasi</a>
      <span className="opacity-40 select-none">•</span>
      <a href="/#contacts" className="hover:text-blue-600 transition-colors">Kontak Darurat</a>
      <span className="opacity-40 select-none">•</span>
      <a href="/#preparedness" className="hover:text-blue-600 transition-colors">Bantuan Warga</a>
    </div>
    
    <div className="flex items-center gap-6 pt-4">
      <div className="flex flex-col items-center gap-1.5">
        <img src="/assets/image/lambang-kabupaten-pangandaran.webp" alt="Lambang Kabupaten Pangandaran" className="h-14 w-auto object-contain" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <img src="/assets/image/logo-widyatama.webp" alt="Logo Universitas Widyatama" className="h-14 w-auto object-contain" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <img src="/assets/image/logo-bmkg.webp" alt="Logo BMKG" className="h-14 w-auto object-contain" />
      </div>
    </div>

    <span className="text-[10px] font-mono mt-5 select-none opacity-50">
      Sistem Berjalan Normal • V 2.4.1
    </span>
  </footer>
);
