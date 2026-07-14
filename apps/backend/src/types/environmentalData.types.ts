/**
 * Type & validasi untuk domain "Environmental Data" sesuai kontrak resmi
 * OpenAPI SIGAP (components/schemas/environmental.yaml#/EnvironmentalData).
 *
 * Ini yang jadi acuan bentuk data yang di-insert ke database, BUKAN bentuk
 * bebas hasil asumsi dari response BMKG.
 */

import { z } from "zod";

export const EnvironmentalDataSourceSchema = z.enum([
  "BMKG",
  "USGS",
  "OpenWeatherMap",
]);
export type EnvironmentalDataSource = z.infer<typeof EnvironmentalDataSourceSchema>;

/**
 * Bentuk data SEBELUM insert ke DB (tanpa `id`, karena id di-generate
 * oleh Postgres/Prisma). Setelah di-insert, hasilnya baru match
 * penuh ke schema `EnvironmentalData` di OpenAPI (yang punya `id`).
 */
export const EnvironmentalDataInputSchema = z.object({
  source: EnvironmentalDataSourceSchema,
  type: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  recorded_at: z.string().datetime(), // ISO 8601, sesuai `format: date-time` di OpenAPI
});
export type EnvironmentalDataInput = z.infer<typeof EnvironmentalDataInputSchema>;

/** Validasi array of EnvironmentalDataInput sekaligus, dipakai setelah parsing */
export const EnvironmentalDataInputListSchema = z.array(EnvironmentalDataInputSchema);
