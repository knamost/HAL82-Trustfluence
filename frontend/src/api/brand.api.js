import { apiGet, apiPut } from "./index";

/**
 * GET /brands — list & filter brands (public)
 */
export async function listBrands(params) {
  return apiGet("/api/brands", params);
}

/**
 * GET /brands/:id — single brand profile (public)
 */
export async function getBrand(id) {
  return apiGet(`/api/brands/${id}`);
}

/**
 * GET /brands/profile — own brand profile (brand only)
 */
export async function getMyBrandProfile() {
  return apiGet("/api/brands/profile");
}

/**
 * PUT /brands/profile — upsert own brand profile (brand only)
 */
export async function upsertBrandProfile(data) {
  return apiPut("/api/brands/profile", data);
}
