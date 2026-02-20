/**
 * @file creator.controller.js
 * @description Handles HTTP request / response for creator profiles.
 *
 * Public endpoints (no auth):
 *   GET /creators       — list & filter creators
 *   GET /creators/:id   — single creator (by profile id)
 *
 * Protected endpoints (creator role):
 *   GET /creators/profile  — own profile
 *   PUT /creators/profile  — create or update own profile
 */

import * as creatorService from '../services/creator.service.js';

/** GET /creators — list with optional query-string filters */
export async function list(req, res) {
  const creators = await creatorService.listCreators(req.query);
  res.json(creators);
}

/** GET /creators/profile — authenticated creator's own profile */
export async function getOwnProfile(req, res) {
  const profile = await creatorService.getCreatorProfile(req.user.id);
  res.json(profile);
}

/** PUT /creators/profile — create or update own profile */
export async function upsertProfile(req, res) {
  const profile = await creatorService.upsertCreatorProfile(req.user.id, req.body);
  res.json(profile);
}

/** GET /creators/:id — public view of a single creator */
export async function getById(req, res) {
  const profile = await creatorService.getCreatorById(req.params.id);
  res.json(profile);
}
