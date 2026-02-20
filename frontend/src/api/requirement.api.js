import { apiGet, apiPost, apiPut, apiDelete } from "./index";

/**
 * GET /requirements — list & filter (public)
 * @param {Object} params — { niche, minFollowers, status, … }
 */
export async function listRequirements(params) {
  return apiGet("/api/requirements", params);
}

/**
 * GET /requirements/:id — single requirement (public)
 */
export async function getRequirement(id) {
  return apiGet(`/api/requirements/${id}`);
}

/**
 * POST /requirements — create a new campaign requirement (brand only)
 */
export async function createRequirement(data) {
  return apiPost("/api/requirements", data);
}

/**
 * PUT /requirements/:id — update an existing requirement (brand owner)
 */
export async function updateRequirement(id, data) {
  return apiPut(`/api/requirements/${id}`, data);
}

/**
 * DELETE /requirements/:id — delete a requirement (brand owner)
 */
export async function deleteRequirement(id) {
  return apiDelete(`/api/requirements/${id}`);
}
