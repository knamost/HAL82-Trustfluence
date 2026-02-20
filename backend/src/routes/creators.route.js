/**
 * @file routes/creators.js
 * @description Creator profile routes.
 *
 * GET  /creators           — list & filter (public)
 * GET  /creators/profile   — own profile  (creator only)
 * PUT  /creators/profile   — upsert own profile (creator only, validated)
 * GET  /creators/:id       — single creator (public)
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upsertCreatorProfileSchema } from '../validation/creator.validation.js';
import * as creatorCtrl from '../controllers/creator.controller.js';

const router = Router();

router.get('/', asyncHandler(creatorCtrl.list));

router.get('/profile', authenticate, authorize('creator'), asyncHandler(creatorCtrl.getOwnProfile));

router.put(
  '/profile',
  authenticate,
  authorize('creator'),
  validate(upsertCreatorProfileSchema),
  asyncHandler(creatorCtrl.upsertProfile),
);

router.get('/:id', asyncHandler(creatorCtrl.getById));

export default router;
