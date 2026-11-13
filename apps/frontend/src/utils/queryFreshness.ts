type QueryFreshness = {
  isError: boolean;
  data: unknown;
  dataUpdatedAt: number;
};

/**
 * TK-07: kegagalan memperbarui tidak menghapus data terakhir. Kartu menampilkan
 * tampilan error hanya bila data belum pernah berhasil dimuat.
 */
export const failedWithoutData = (query: QueryFreshness) =>
  query.isError && query.data === undefined;

/** Waktu data terakhir berhasil dimuat, bila pembaruan terakhir gagal. */
export const getStaleSince = (query: QueryFreshness) =>
  query.isError && query.data !== undefined ? query.dataUpdatedAt : undefined;
