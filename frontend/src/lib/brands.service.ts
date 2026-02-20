/**
 * Brands API service
 */
import { apiGet, apiPut } from "./api-client";

export interface BrandProfile {
  id: string;
  userId: string;
  companyName: string;
  bio: string | null;
  logoUrl: string | null;
  website: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  avgRating?: number;
  ratingCount?: number;
}

export interface BrandListParams {
  category?: string;
  minRating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

/** List brands (public) */
export async function listBrands(params: BrandListParams = {}): Promise<BrandProfile[]> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.minRating) qs.set("minRating", String(params.minRating));
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiGet<BrandProfile[]>(`/brands${query ? `?${query}` : ""}`);
}

/** Get single brand profile (public) */
export async function getBrand(id: string): Promise<BrandProfile> {
  return apiGet<BrandProfile>(`/brands/${id}`);
}

/** Get own brand profile (auth) */
export async function getMyBrandProfile(): Promise<BrandProfile> {
  return apiGet<BrandProfile>("/brands/profile", true);
}

/** Upsert own brand profile (auth) — PUT /brands/profile */
export async function upsertBrandProfile(payload: {
  companyName: string;
  bio?: string;
  logoUrl?: string;
  website?: string;
  category?: string;
}): Promise<BrandProfile> {
  // Strip empty-string optional fields so Zod URL validation doesn't reject them
  const clean: Record<string, unknown> = { companyName: payload.companyName };
  if (payload.bio) clean.bio = payload.bio;
  if (payload.logoUrl) clean.logoUrl = payload.logoUrl;
  if (payload.website) clean.website = payload.website;
  if (payload.category) clean.category = payload.category;
  return apiPut<BrandProfile>("/brands/profile", clean, true);
}
