/**
 * @file requirement.controller.js
 * @description Handles HTTP request / response for campaign requirements.
 *
 * Public:
 *   GET /requirements      — list & filter
 *   GET /requirements/:id  — single requirement
 *
 * Protected (brand role):
 *   POST   /requirements      — create a new requirement
 *   PUT    /requirements/:id  — update (owner only)
 *   DELETE /requirements/:id  — delete (owner only)
 */

import * as reqService from '../services/requirement.service.js';

/** GET /requirements — list with optional filters */
export async function list(req, res) {
  const items = await reqService.listRequirements(req.query);
  res.json(items);
}

/** POST /requirements — create a new campaign requirement */
export async function create(req, res) {
  const item = await reqService.createRequirement(req.user.id, req.body);
  res.status(201).json(item);
}

/** GET /requirements/:id — single requirement by id */
export async function getById(req, res) {
  const item = await reqService.getRequirementById(req.params.id);
  res.json(item);
}

/** PUT /requirements/:id — update an existing requirement (owner only) */
export async function update(req, res) {
  const item = await reqService.updateRequirement(req.params.id, req.user.id, req.body);
  res.json(item);
}

/** DELETE /requirements/:id — delete a requirement (owner only) */
export async function remove(req, res) {
  const result = await reqService.deleteRequirement(req.params.id, req.user.id);
  res.json(result);
}
