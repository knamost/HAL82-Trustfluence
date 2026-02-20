/**
 * @file social.controller.js
 * @description Handles HTTP request / response for social-media metrics.
 *
 * GET  /social/:platform/:handle — fetch metrics (DB first, mock fallback)
 * PUT  /social/metrics           — update own social metrics (creator only)
 */

import { fetchSocialMetrics, updateSocialMetrics } from '../services/social.service.js';

/** GET /social/:platform/:handle */
export async function getMetrics(req, res) {
  const { platform, handle } = req.params;
  const metrics = await fetchSocialMetrics(platform, handle);
  res.json(metrics);
}

/** PUT /social/metrics — update the authenticated creator's social stats */
export async function updateMetrics(req, res) {
  const updated = await updateSocialMetrics(req.user.id, req.body);
  res.json(updated);
}
