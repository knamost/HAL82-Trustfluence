/**
 * Brands API service
 */
import { apiGet, apiPut } from "./api-client";

/** List brands (public) */
export async function listBrands(params = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.minRating) qs.set("minRating", String(params.minRating));
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiGet(`/brands${query ? `?${query}` : ""}`);
}

/** Get single brand profile (public) */
export async function getBrand(id) {
  return apiGet(`/brands/${id}`);
}

/** Get own brand profile (auth) */
export async function getMyBrandProfile() {
  return apiGet("/brands/profile", true);
}

/** Upsert own brand profile (auth) — PUT /brands/profile */
export async function upsertBrandProfile(payload) {
  // Strip empty-string optional fields so Zod URL validation doesn't reject them
  const clean = { companyName: payload.companyName };
  if (payload.bio) clean.bio = payload.bio;
  if (payload.logoUrl) clean.logoUrl = payload.logoUrl;
  if (payload.website) clean.website = payload.website;
  if (payload.category) clean.category = payload.category;
  return apiPut("/brands/profile", clean, true);
}
