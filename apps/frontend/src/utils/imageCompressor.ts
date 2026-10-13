/**
 * Utility untuk kompresi gambar di sisi klien sebelum dikirim ke database backend.
 * Memastikan payload tetap hemat kuota Neon DB (target ~30-60 KB per gambar dalam format WebP).
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSizeBytes?: number;
}

const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function compressImageToWebp(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 450,
    quality = 0.8,
    maxFileSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  } = options;

  if (!file.type.startsWith("image/")) {
    throw new Error("File yang dipilih bukan berkas gambar yang valid.");
  }

  if (file.size > maxFileSizeBytes) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Ukuran file (${sizeInMb} MB) melebihi batas maksimal 5 MB.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung skala aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Gagal menginisialisasi canvas context rendering."));
          return;
        }

        // Gambar ke canvas dengan smoothing berkualitas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke WebP DataURL, fallback otomatis ke JPEG bila browser lawas
        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error("Gagal memproses file gambar. Berkas mungkin korup."));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Gagal membaca file dari disk lokal."));
    };

    reader.readAsDataURL(file);
  });
}
