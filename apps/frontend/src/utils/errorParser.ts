import axios from "axios";

/**
 * Mengubah berbagai jenis error API/Network/Validasi menjadi pesan bahasa Indonesia
 * yang jelas, komunikatif, dan mematuhi ketentuan keamanan SIGAP tanpa kode teknis mentah.
 */
export function parseApiError(
  err: unknown,
  fallbackMessage = "Terjadi kendala saat memproses data. Silakan periksa kembali formulir Anda."
): string {
  if (!err) return fallbackMessage;

  // 1. Tangani Error dari Axios HTTP Client
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data as
      | {
          success?: boolean;
          message?: string;
          errors?: Record<string, string> | string[] | string;
        }
      | undefined;

    // A. Validasi Gagal (422 Unprocessable Entity atau 400 Bad Request)
    if (status === 422 || status === 400) {
      if (data?.errors) {
        if (typeof data.errors === "object" && !Array.isArray(data.errors)) {
          const fieldMessages = Object.entries(data.errors)
            .map(([field, msg]) => {
              // Terjemahkan nama field bila perlu, atau gunakan pesan langsung dari backend
              return typeof msg === "string" ? msg : String(msg);
            })
            .filter(Boolean);

          if (fieldMessages.length > 0) {
            return fieldMessages.join("\n• ");
          }
        } else if (Array.isArray(data.errors)) {
          const stringErrors = data.errors.map(String).filter(Boolean);
          if (stringErrors.length > 0) {
            return stringErrors.join("\n• ");
          }
        } else if (typeof data.errors === "string" && data.errors.trim().length > 0) {
          return data.errors;
        }
      }

      if (data?.message && data.message !== "Validasi gagal.") {
        return data.message;
      }

      return "Data yang Anda masukkan tidak memenuhi ketentuan validasi keamanan SIGAP. Silakan periksa kembali setiap kolom.";
    }

    // B. Akses Ditolak (403 Forbidden - Role / Permission RBAC)
    if (status === 403) {
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        return `Akses Ditolak: ${data.errors[0]}`;
      }
      if (data?.message && data.message !== "Akses ditolak.") {
        return `Akses Ditolak: ${data.message}`;
      }
      return "Akses Ditolak: Akun Anda saat ini tidak memiliki izin (permission) untuk menyimpan data ini. Silakan hubungi Administrator Desa atau masuk ulang.";
    }

    // C. Sesi Kedaluwarsa (401 Unauthorized)
    if (status === 401) {
      return "Sesi login Anda telah berakhir atau belum terverifikasi. Silakan muat ulang halaman dan login kembali.";
    }

    // D. Batas Frekuensi Akses (429 Too Many Requests)
    if (status === 429) {
      return "Terlalu banyak permintaan dalam waktu singkat demi keamanan sistem. Silakan tunggu beberapa saat sebelum mencoba lagi.";
    }

    // E. Gangguan Server (500 / 502 / 503)
    if (status && status >= 500) {
      return "Terjadi gangguan sementara pada server pusat data desa. Silakan coba kembali dalam beberapa saat.";
    }

    // F. Kendala Jaringan / Koneksi Terputus
    if (err.code === "ERR_NETWORK" || !err.response) {
      return "Koneksi internet Anda terputus atau server tidak dapat dihubungi. Pastikan perangkat Anda terhubung ke internet.";
    }

    // G. Pesan bawaan dari response data jika ada
    if (data?.message && typeof data.message === "string" && data.message.trim().length > 0) {
      return data.message;
    }
  }

  // 2. Tangani Error JavaScript Standar
  if (err instanceof Error) {
    const msg = err.message;
    // Bersihkan pesan teknis axios bawaan
    if (msg.includes("status code 403")) {
      return "Akses Ditolak: Akun Anda tidak memiliki izin untuk menyimpan data ini. Silakan hubungi Administrator Desa.";
    }
    if (msg.includes("status code 401")) {
      return "Sesi login Anda telah berakhir. Silakan masuk kembali.";
    }
    if (msg.includes("status code 422") || msg.includes("status code 400")) {
      return "Data formulir tidak memenuhi ketentuan batasan karakter atau format yang diizinkan.";
    }
    if (msg.includes("Network Error")) {
      return "Terjadi gangguan koneksi jaringan saat menghubungi server.";
    }
    return msg;
  }

  return fallbackMessage;
}
