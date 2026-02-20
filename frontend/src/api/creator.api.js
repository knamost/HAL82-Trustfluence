import { apiGet, apiPut } from "./index";

/**
 * GET /creators — list & filter creators (public)
 * @param {Object} params — { search, niche, minFollowers, minEngagement }
 */
export async function listCreators(params) {
  return apiGet("/creators", params);
}

/**
 * GET /creators/:id — single creator profile (public)
 */
export async function getCreator(id) {
  return apiGet(`/creators/${id}`);
}

/**
 * GET /creators/profile — own creator profile (creator only)
 */
export async function getMyCreatorProfile() {
  return apiGet("/creators/profile");
}

/**
 * PUT /creators/profile — upsert own creator profile (creator only)
 */
export async function upsertCreatorProfile(data) {
  return apiPut("/creators/profile", data);
}