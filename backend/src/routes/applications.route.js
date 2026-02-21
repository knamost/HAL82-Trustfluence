/**
 * @file routes/applications.route.js
 * @description Campaign application routes.
 *
 * POST   /applications                     — apply (creator only, validated)
 * GET    /applications/mine                 — my applications (creator)
 * GET    /applications/requirement/:reqId   — applicants list (brand owner)
 * GET    /applications/:id                  — single application (authenticated)
 * PUT    /applications/:id/status           — accept/reject (brand)
 * PUT    /applications/:id/withdraw         — withdraw (creator)
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from '../validation/application.validation.js';
import * as appCtrl from '../controllers/application.controller.js';

const router = Router();

// Creator: submit application
router.post(
  '/',
  authenticate,
  authorize('creator'),
  validate(createApplicationSchema),
  asyncHandler(appCtrl.apply),
);

// Creator: list my applications
router.get('/mine', authenticate, authorize('creator'), asyncHandler(appCtrl.listMine));

// Brand: list applicants for a requirement
router.get(
  '/requirement/:reqId',
  authenticate,
  authorize('brand'),
  asyncHandler(appCtrl.listForRequirement),
);

// Authenticated: list accepted partners for review dropdown
router.get('/accepted-partners', authenticate, asyncHandler(appCtrl.listAcceptedPartners));

// Authenticated: get single application
router.get('/:id', authenticate, asyncHandler(appCtrl.getById));

// Brand: accept / reject
router.put(
  '/:id/status',
  authenticate,
  authorize('brand'),
  validate(updateApplicationStatusSchema),
  asyncHandler(appCtrl.updateStatus),
);

// Creator: withdraw
router.put('/:id/withdraw', authenticate, authorize('creator'), asyncHandler(appCtrl.withdraw));

export default router;
