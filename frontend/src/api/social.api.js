import { apiGet, apiPut } from "./index";

/**
 * GET /social/:platform/:handle — fetch social metrics
 */
export async function getSocialMetrics(platform, handle) {
  return apiGet(`/api/social/${platform}/${handle}`);
}

/**
 * PUT /social/metrics — update own social metrics (creator only)
 * @param {Object} data — { followersCount?, engagementRate?, platform?, socialHandle? }
 */
export async function updateSocialMetrics(data) {
  return apiPut("/api/social/metrics", data);
}
