import { apiGet, apiPut } from "./index";

/**
 * GET /creators — list & filter creators (public)
 * @param {Object} params — { search, niche, minFollowers, minEngagement }
 */
export async function listCreators(params) {
  return apiGet("/api/creators", params);
}

/**
 * GET /creators/:id — single creator profile (public)
 */
export async function getCreator(id) {
  return apiGet(`/api/creators/${id}`);
}

/**
 * GET /creators/profile — own creator profile (creator only)
 */
export async function getMyCreatorProfile() {
  return apiGet("/api/creators/profile");
}

/**
 * PUT /creators/profile — upsert own creator profile (creator only)
 */
export async function upsertCreatorProfile(data) {
  return apiPut("/api/creators/profile", data);
}