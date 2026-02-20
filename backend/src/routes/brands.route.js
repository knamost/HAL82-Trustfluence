/**
 * @file routes/brands.js
 * @description Brand profile routes.
 *
 * GET  /brands           — list & filter (public)
 * GET  /brands/profile   — own profile  (brand only)
 * PUT  /brands/profile   — upsert own profile (brand only, validated)
 * GET  /brands/:id       — single brand (public)
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upsertBrandProfileSchema } from '../validation/brand.validation.js';
import * as brandCtrl from '../controllers/brand.controller.js';

const router = Router();

router.get('/', asyncHandler(brandCtrl.list));

router.get('/profile', authenticate, authorize('brand'), asyncHandler(brandCtrl.getOwnProfile));

router.put(
  '/profile',
  authenticate,
  authorize('brand'),
  validate(upsertBrandProfileSchema),
  asyncHandler(brandCtrl.upsertProfile),
);

router.get('/:id', asyncHandler(brandCtrl.getById));

export default router;
