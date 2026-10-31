import type { HelmetOptions } from "helmet";

/**
 * SEC-06: Konfigurasi security headers untuk backend sebagai JSON REST API murni.
 * Backend tidak menyajikan HTML/asset, sehingga CSP dibuat seketat mungkin
 * (tidak ada sumber yang diizinkan) dan response tidak boleh di-embed/di-frame.
 * Header helmet lain yang tidak disebut di sini tetap memakai default helmet.
 */
export const helmetOptions: HelmetOptions = {
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
    },
  },
  xFrameOptions: { action: "deny" },
  referrerPolicy: { policy: "no-referrer" },
  // preload sengaja false: HSTS preload praktis tidak bisa ditarik kembali.
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: false },
};
