import type {
  AiSummary,
  Announcement,
  CurrentAlert,
  CurrentWeather,
  Earthquake,
  EmergencyContact,
  TsunamiStatus,
  WeatherForecastItem,
} from "../../../types/dashboard";

export const dummyAISummary: AiSummary = {
  summary:
    "Selamat datang di Dashboard SIGAP Desa Cibenda.\n\nSaat ini fitur Ringkasan SIGAP AI masih dalam tahap pengembangan. Nantinya AI akan membantu merangkum kondisi cuaca, gempa bumi, tsunami, serta memberikan rekomendasi kesiapsiagaan berdasarkan data resmi BMKG.",
};

export const dummyCurrentAlert: CurrentAlert = {
  level: "GREEN",
  source: "BMKG",
  description: "Tidak ada ancaman bencana aktif saat ini. Sistem demo menampilkan status aman sementara.",
  updatedAt: "2026-07-18T08:30:00+07:00",
};

export const dummyWeather: CurrentWeather = {
  temperature: 29,
  humidity: 76,
  weather: "Cerah Berawan",
  windSpeed: 12,
  windDirection: "SE",
  visibility: "10 km",
  updatedAt: "2026-07-18T08:30:00+07:00",
};

export const dummyForecast: WeatherForecastItem[] = [
  {
    label: "Hari Ini",
    date: "2026-07-18",
    condition: "Cerah Berawan",
    temperature: 30,
    rainProbability: 20,
  },
  {
    label: "Besok",
    date: "2026-07-19",
    condition: "Berawan",
    temperature: 29,
    rainProbability: 25,
  },
  {
    label: "Lusa",
    date: "2026-07-20",
    condition: "Hujan Ringan",
    temperature: 28,
    rainProbability: 55,
  },
  {
    label: "Rabu",
    date: "2026-07-21",
    condition: "Cerah",
    temperature: 31,
    rainProbability: 15,
  },
];

export const dummyEarthquake: Earthquake = {
  magnitude: 4.8,
  depth: "10 km",
  location: "64 km barat daya Kabupaten Pangandaran",
  distanceToVillage: 62,
  felt: "II-III MMI di wilayah Cibenda",
  potential: "Tidak berpotensi tsunami",
  updatedAt: "2026-07-18T07:45:00+07:00",
};

export const dummyTsunami: TsunamiStatus = {
  status: "NORMAL",
  description: "Tidak terdapat potensi tsunami untuk wilayah pesisir selatan pada pembaruan ini.",
  source: "BMKG InaTEWS",
  updatedAt: "2026-07-18T07:45:00+07:00",
};

export const dummyAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    title: "Latihan simulasi evakuasi warga",
    content:
      "Pemerintah Desa Cibenda akan mengadakan simulasi evakuasi pada pekan depan bersama relawan siaga bencana.",
    publishedAt: "2026-07-18",
    priority: "HIGH",
  },
  {
    id: "ann-2",
    title: "Pengecekan jalur aman dusun",
    content:
      "Tim desa sedang meninjau titik kumpul dan akses jalan menuju area aman untuk pembaruan peta evakuasi.",
    publishedAt: "2026-07-17",
    priority: "MEDIUM",
  },
  {
    id: "ann-3",
    title: "Imbauan pantau informasi resmi",
    content: "Warga diimbau memantau kanal resmi SIGAP dan BMKG ketika cuaca mulai berubah cepat.",
    publishedAt: "2026-07-16",
    priority: "LOW",
  },
];

export const dummyContacts: EmergencyContact[] = [
  { institution: "Ambulans", phone: "119" },
  { institution: "Pemadam Kebakaran", phone: "113" },
  { institution: "Polisi", phone: "110" },
  { institution: "Puskesmas Pangandaran", phone: "(0265) 0001" },
  { institution: "BPBD Pangandaran", phone: "(0265) 0001" },
  { institution: "Kepala Desa Cibenda", phone: "08xxxx" },
];

export const dummyEvacuation = {
  image: "/assets/image/peta-evakuasi.webp",
  title: "Peta Jalur Evakuasi Desa Cibenda",
  description:
    "Peta evakuasi ini merupakan ilustrasi jalur evakuasi sementara. Jalur resmi akan diperbarui berdasarkan data pemerintah desa dan BPBD.",
  details: [
    {
      label: "Titik Kumpul Evakuasi",
      value: "Lapang Kantor Desa Cibenda",
    },
    {
      label: "Jalur Evakuasi",
      value: "Mengikuti jalur utama menuju area aman.",
    },
    {
      label: "Status",
      value: "Data masih bersifat simulasi, dapat disesuaikan dengan titik evakuasi",
    },
  ],
  buttonLabel: "Lihat Peta Evakuasi",
} as const;
