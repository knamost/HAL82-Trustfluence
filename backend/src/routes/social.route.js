/**
 * @file routes/social.js
 * @description Social-media metrics routes.
 *
 * GET  /social/:platform/:handle — fetch metrics (DB first, mock fallback)
 * PUT  /social/metrics           — update own social metrics (creator only)
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateSocialMetricsSchema } from '../validation/social.validation.js';
import * as socialCtrl from '../controllers/social.controller.js';

const router = Router();

router.put(
  '/metrics',
  authenticate,
  authorize('creator'),
  validate(updateSocialMetricsSchema),
  asyncHandler(socialCtrl.updateMetrics),
);

router.get('/:platform/:handle', asyncHandler(socialCtrl.getMetrics));

export default router;
