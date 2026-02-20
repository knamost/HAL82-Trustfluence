/**
 * Social metrics API service
 */
import { apiGet } from "./api-client";

export interface SocialMetrics {
  platform: string;
  handle: string;
  followersCount: number;
  engagementRate: number;
  fetchedAt: string;
  note: string;
}

/** Fetch social metrics for a given platform & handle (mock/public) */
export async function getSocialMetrics(
  platform: string,
  handle: string
): Promise<SocialMetrics> {
  return apiGet<SocialMetrics>(`/social/${platform}/${handle}`);
}
