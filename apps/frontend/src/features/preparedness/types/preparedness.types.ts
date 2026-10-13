export type GuideSourceType = "RESMI" | "MITRA";
export type GuideFormatType = "ARTICLE" | "EXTERNAL_URL";

export interface PreparednessGuideRecord {
  id: string;
  title: string;
  sourceType: GuideSourceType;
  content: string | null;
  externalUrl: string | null;
  imageUrl: string | null;
  sourceLabel?: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePreparednessGuideInput {
  title: string;
  sourceType?: GuideSourceType;
  content?: string | null;
  externalUrl?: string | null;
  imageUrl: string;
  sourceLabel?: string | null;
  publishedAt?: string;
}

export interface UpdatePreparednessGuideInput {
  title?: string;
  sourceType?: GuideSourceType;
  content?: string | null;
  externalUrl?: string | null;
  imageUrl?: string;
  sourceLabel?: string | null;
  publishedAt?: string;
}
