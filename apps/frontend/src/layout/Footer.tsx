export const Footer = () => (
  <footer className="w-full mt-12 pt-8 pb-6 border-t border-gray-100 flex flex-col items-center text-center">
    
    <div className="flex items-center gap-2 mb-3">
      <span className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs select-none shadow-sm">
        S
      </span>
      <strong className="text-2xl font-bold text-gray-800 tracking-wider uppercase">
        SIGAP DESA CIBENDA
      </strong>
    </div>

    <p className="text-xs text-gray-500 max-w-xl leading-relaxed px-4 mb-4">
      © 2026 Pemerintah Desa Cibenda. Data kedaruratan diintegrasikan secara langsung bersumber dari BMKG(Badan Meteorologi, Klimatologi, dan Geofisika) sebagai sumber data.
    </p>

    <div className="flex items-center gap-5 mb-6 text-xs font-medium text-gray-500">
      <a href="/#privacy" className="hover:text-blue-600 transition-colors">Kebijakan Privasi</a>
      <span className="text-gray-300 select-none">•</span>
      <a href="/#contacts" className="hover:text-blue-600 transition-colors">Kontak Darurat</a>
      {/* <span className="text-gray-300 select-none">•</span> */}
      {/* <a href="/#preparedness" className="hover:text-blue-600 transition-colors">Bantuan Warga</a> */}
    </div>

      <div className="flex items-center gap-6 pt-4 border-t border-gray-50/80 w-full max-w-md justify-center">
      <div className="flex flex-col items-center gap-1.5">
          <img src="/assets/image/logo-widyatama.webp" alt="Logo Universitas Widyatama" className="h-14 w-auto object-contain" />
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <img src="/assets/image/logo-bmkg.webp" alt="Logo BMKG" className="h-14 w-auto object-contain" />
      </div>
    </div>

    <span className="text-[10px] text-gray-400 font-mono mt-5 select-none opacity-70">
      Sistem Berjalan Normal • V 2.4.1
    </span>
  </footer>
);