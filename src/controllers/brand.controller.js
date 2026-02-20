/**
 * @file brand.controller.js
 * @description Handles HTTP request / response for brand profiles.
 *
 * Public endpoints:
 *   GET /brands       — list & filter brands
 *   GET /brands/:id   — single brand (by profile id)
 *
 * Protected endpoints (brand role):
 *   GET /brands/profile  — own profile
 *   PUT /brands/profile  — create or update own profile
 */

import * as brandService from '../services/brand.service.js';

/** GET /brands — list with optional query-string filters */
export async function list(req, res) {
  const brands = await brandService.listBrands(req.query);
  res.json(brands);
}

/** GET /brands/profile — authenticated brand's own profile */
export async function getOwnProfile(req, res) {
  const profile = await brandService.getBrandProfile(req.user.id);
  res.json(profile);
}

/** PUT /brands/profile — create or update own profile */
export async function upsertProfile(req, res) {
  const profile = await brandService.upsertBrandProfile(req.user.id, req.body);
  res.json(profile);
}

/** GET /brands/:id — public view of a single brand */
export async function getById(req, res) {
  const profile = await brandService.getBrandById(req.params.id);
  res.json(profile);
}
