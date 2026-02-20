/**
 * Creators API service
 */
import { apiGet, apiPut } from "./api-client";

export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  platform: string | null;
  socialHandle: string | null;
  followersCount: number;
  engagementRate: number;
  niches: string[];
  promotionTypes: string[];
  createdAt: string;
  updatedAt: string;
  // joined fields from public endpoint
  avgRating?: number;
  ratingCount?: number;
}

export interface CreatorListParams {
  niche?: string;
  minFollowers?: number;
  minEngagement?: number;
  search?: string;
  page?: number;
  limit?: number;
}

/** List / search creators (public) */
export async function listCreators(params: CreatorListParams = {}): Promise<CreatorProfile[]> {
  const qs = new URLSearchParams();
  if (params.niche) qs.set("niche", params.niche);
  if (params.minFollowers) qs.set("minFollowers", String(params.minFollowers));
  if (params.minEngagement) qs.set("minEngagement", String(params.minEngagement));
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiGet<CreatorProfile[]>(`/creators${query ? `?${query}` : ""}`);
}

/** Get single creator profile (public) */
export async function getCreator(id: string): Promise<CreatorProfile> {
  return apiGet<CreatorProfile>(`/creators/${id}`);
}

/** Get own creator profile (auth) */
export async function getMyCreatorProfile(): Promise<CreatorProfile> {
  return apiGet<CreatorProfile>("/creators/profile", true);
}

/** Upsert own creator profile (auth) */
export async function upsertCreatorProfile(payload: {
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  platform?: string;
  socialHandle?: string;
  followersCount?: number;
  engagementRate?: number;
  niches?: string[];
  promotionTypes?: string[];
}): Promise<CreatorProfile> {
  return apiPut<CreatorProfile>("/creators/profile", payload, true);
}
