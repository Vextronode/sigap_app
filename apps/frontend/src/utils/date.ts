const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
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
  if (!value) return "Belum tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${timeFormatter.format(date)} WIB - ${dateFormatter.format(date)}`;
};

export const formatWeekday = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return weekdayFormatter.format(date);
};
