/**
 * @file social.controller.js
 * @description Handles HTTP request / response for the social-media metrics endpoint.
 *
 * Currently uses a **mock** data source. In production, swap in real
 * API calls (Instagram Graph API, TikTok API, YouTube Data API, etc.).
 */

import { fetchSocialMetrics } from '../services/social.service.js';

/** GET /social/:platform/:handle — fetch social-media metrics (mock) */
export function getMetrics(req, res) {
  const { platform, handle } = req.params;
  const metrics = fetchSocialMetrics(platform, handle);
  res.json(metrics);
}
