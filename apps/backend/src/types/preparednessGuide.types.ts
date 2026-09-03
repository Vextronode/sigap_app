// tipe data sumber panduan
export type GuideSourceType = "RESMI" | "MITRA";

// tipe data rekaman panduan kesiapsiagaan
export interface PreparednessGuideRecord {
  id: string;
  title: string;
  content: string | null;
  externalUrl: string | null;
  sourceType: GuideSourceType;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// dto pembuatan panduan kesiapsiagaan baru
export interface CreatePreparednessGuideDto {
  title: string;
  content?: string | null;
  externalUrl?: string | null;
  sourceType?: GuideSourceType;
  publishedAt?: Date | string;
}

// dto pembaruan panduan kesiapsiagaan
export interface UpdatePreparednessGuideDto {
  title?: string;
  content?: string | null;
  externalUrl?: string | null;
  sourceType?: GuideSourceType;
  publishedAt?: Date | string;
}
