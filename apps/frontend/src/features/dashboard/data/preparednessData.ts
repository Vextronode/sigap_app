export type PreparednessGuideItem = {
  title: string;
  points: string[];
  image: string;
  href: string;
  buttonLabel: string;
};

export const preparednessGuideData: PreparednessGuideItem[] = [
  {
    title: "Protokol Tanggap Gempa Bumi (Sebelum, Saat, Sesudah)",
    points: [
      "Sebelum Terjadi Gempa (Kesiapsiagaan): Kenali lingkungan dengan cara pahami jalur evakuasi, titik kumpul, dan kontak darurat.",
      "Saat Terjadi Gempa (Penyelamatan): Jangan panik. Lindungi kepala Anda dengan menunduk, dan berpegangan di bawah meja yang kokoh.",
      "Setelah Terjadi Gempa (Evakuasi): Segera keluar dari rumah mengikuti jalur evakuasi, dan jauhi area pantai. Tetap waspadai gempa bumi susulan."
    ],
    image: "/assets/image/earthquake-ilustration.webp",
    href: "https://content.bmkg.go.id/wp-content/uploads/PPT-SLG_Kesiapsiagaan-Menghadapai-Gempabumii.pdf",
    buttonLabel: "Baca Panduan Lengkap",
  },
  {
    title: "Tanggap Mitigasi Tsunami (20-20-20)",
    points: [
      "20 Detik: Jika merasakan gempa kuat atau gempa lemah yang lebih dari 20 detik, segera lari menjauh dari pantai.",
      "20 Meter (Cari Ketinggian): Segera lakukan evakuasi mandiri dengan berlari menjauhi pantai menuju area aman yang memiliki ketinggian minimal 20 meter.",
      "20 Menit (Waktu Emas): Maksimalkan waktu 20 menit pertama untuk menyelamatkan diri, jangan menunggu sirine atau pengumuman resmi."
    ],
    image: "/assets/image/tsunami-ilustration.webp",
    href: "https://www.goodnewsfromindonesia.id/2024/08/20/mengenal-skema-20-20-20-langkah-tanggap-mitigasi-tsunami",
    buttonLabel: "Baca Panduan Lengkap",
  },
];