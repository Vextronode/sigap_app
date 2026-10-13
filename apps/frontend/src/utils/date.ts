const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

const weekdayFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
});

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

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfEventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  const diffDays = Math.round((startOfToday - startOfEventDay) / (1000 * 60 * 60 * 24));

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
