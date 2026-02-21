/**
 * @file application.controller.js
 * @description Handles HTTP request / response for campaign applications.
 *
 * Creator endpoints:
 *   POST   /applications                     — apply to a requirement
 *   GET    /applications/mine                 — list my applications
 *   PUT    /applications/:id/withdraw         — withdraw an application
 *
 * Brand endpoints:
 *   GET    /applications/requirement/:reqId   — list applications for a requirement
 *   PUT    /applications/:id/status           — accept / reject
 *
 * Shared:
 *   GET    /applications/:id                  — get single application
 */

import * as appService from '../services/application.service.js';

/** POST /applications — creator applies to a requirement */
export async function apply(req, res) {
  const app = await appService.createApplication(
    req.user.id,
    req.body.requirementId,
    req.body,
  );
  res.status(201).json(app);
}

/** GET /applications/mine — list current creator's applications */
export async function listMine(req, res) {
  const items = await appService.listMyApplications(req.user.id);
  res.json(items);
}

/** GET /applications/requirement/:reqId — brand sees applicants */
export async function listForRequirement(req, res) {
  const items = await appService.listApplicationsForRequirement(
    req.params.reqId,
    req.user.id,
  );
  res.json(items);
}

/** PUT /applications/:id/status — brand accepts/rejects */
export async function updateStatus(req, res) {
  const item = await appService.updateApplicationStatus(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body.status,
  );
  res.json(item);
}

/** GET /applications/accepted-partners — list brands/creators with accepted relationship */
export async function listAcceptedPartners(req, res) {
  const items = await appService.listAcceptedPartners(req.user.id, req.user.role);
  res.json(items);
}

/** PUT /applications/:id/withdraw — creator withdraws */
export async function withdraw(req, res) {
  const item = await appService.updateApplicationStatus(
    req.params.id,
    req.user.id,
    'creator',
    'withdrawn',
  );
  res.json(item);
}

/** GET /applications/:id — get single application */
export async function getById(req, res) {
  const item = await appService.getApplicationById(req.params.id);
  res.json(item);
}
