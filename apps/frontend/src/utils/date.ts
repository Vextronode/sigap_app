/**
 * Seluruh tanggal dan jam ditampilkan dan dibandingkan dalam WIB (Asia/Jakarta),
 * tidak bergantung zona waktu perangkat (TK-05).
 */
export const WIB_TIME_ZONE = "Asia/Jakarta";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: WIB_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: WIB_TIME_ZONE,
});

const weekdayFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  timeZone: WIB_TIME_ZONE,
});

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: WIB_TIME_ZONE,
});

const wibTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: WIB_TIME_ZONE,
});

const wibDayFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: WIB_TIME_ZONE,
});

const longDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: WIB_TIME_ZONE,
});

/** Tanggal kalender WIB dalam format "YYYY-MM-DD". */
const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: WIB_TIME_ZONE });

const hourFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hourCycle: "h23",
  timeZone: WIB_TIME_ZONE,
});

const DAY_MS = 24 * 60 * 60 * 1000;

export const wibDateKey = (date: Date) => dateKeyFormatter.format(date);

/** Jam (0-23) dalam WIB. */
export const wibHour = (date = new Date()) => Number(hourFormatter.format(date));

/** Selisih hari kalender WIB dari `from` ke `to`, mis. 1 bila `from` adalah kemarin. */
export const wibDayDiff = (from: Date, to: Date) => {
  const toUtcDay = (date: Date) => {
    const [year, month, day] = wibDateKey(date).split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((toUtcDay(to) - toUtcDay(from)) / DAY_MS);
};

/** Jam WIB, mis. "10.12 WIB"; tanggal ikut ditampilkan bila bukan hari ini (WIB). */
export const formatWibMoment = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const time = `${wibTimeFormatter.format(date).replace(":", ".")} WIB`;
  const isToday = wibDayFormatter.format(date) === wibDayFormatter.format(new Date());
  return isToday ? time : `${wibDayFormatter.format(date)} ${time}`;
};

/** Mis. "Kamis, 12 November 2026 - 14.23 WIB". */
export const formatWibLongDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${longDateTimeFormatter.format(date).replace(" pukul ", " - ").replace(":", ".")} WIB`;
};

export const formatShortDate = (value?: string) => {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length === 3) {
    // Tanggal tanpa jam: tengah hari UTC jatuh pada tanggal kalender yang sama di WIB.
    const localDate = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12));
    if (!Number.isNaN(localDate.getTime())) {
      return shortDateFormatter.format(localDate);
    }
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return shortDateFormatter.format(date);
};

export const formatDate = (value?: string) => {
  if (!value) return "Belum tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
};

export const formatTime = (value?: string) => {
  if (!value) return "Belum tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return timeFormatter.format(date);
};

export const formatDateTime = (value?: string) => {
  if (!value) {
    return {
      time: "--:-- WIB",
      date: "Belum tersedia",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      time: "--:-- WIB",
      date: value,
    };
  }

  return {
    time: `${timeFormatter.format(date).replace(":", ".")} WIB`,
    date: dateFormatter.format(date),
  };
};

export const formatWeekday = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return weekdayFormatter.format(date);
};

export type DaysAgoTone = "today" | "recent" | "past";

export type DaysAgoInfo = {
  text: string;
  diffDays: number;
  tone: DaysAgoTone;
};

export const getDaysAgoInfo = (value?: string): DaysAgoInfo | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const diffDays = wibDayDiff(date, new Date());

  if (diffDays <= 0) {
    return {
      text: "Hari ini",
      diffDays: 0,
      tone: "today",
    };
  }

  if (diffDays <= 6) {
    return {
      text: `+${diffDays} hari yang lalu`,
      diffDays,
      tone: "recent",
    };
  }

  return {
    text: `+${diffDays} hari yang lalu`,
    diffDays,
    tone: "past",
  };
};

export const formatDaysAgo = (value?: string): string | null => {
  return getDaysAgoInfo(value)?.text ?? null;
};
