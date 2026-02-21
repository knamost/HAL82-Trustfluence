/**
 * @file routes/requirements.js
 * @description Campaign requirement routes.
 *
 * GET    /requirements      — list & filter   (public)
 * POST   /requirements      — create          (brand only, validated)
 * GET    /requirements/:id  — single          (public)
 * PUT    /requirements/:id  — update          (brand owner, validated)
 * DELETE /requirements/:id  — delete          (brand owner)
 * POST   /requirements/:id/apply — creator applies (shortcut)
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createRequirementSchema, updateRequirementSchema } from '../validation/requirement.validation.js';
import * as reqCtrl from '../controllers/requirement.controller.js';
import * as appCtrl from '../controllers/application.controller.js';

const router = Router();

router.get('/', asyncHandler(reqCtrl.list));

router.post(
  '/',
  authenticate,
  authorize('brand'),
  validate(createRequirementSchema),
  asyncHandler(reqCtrl.create),
);

router.get('/:id', asyncHandler(reqCtrl.getById));

router.put(
  '/:id',
  authenticate,
  authorize('brand'),
  validate(updateRequirementSchema),
  asyncHandler(reqCtrl.update),
);

router.delete('/:id', authenticate, authorize('brand'), asyncHandler(reqCtrl.remove));

// Shortcut: POST /requirements/:id/apply (creator only)
router.post(
  '/:id/apply',
  authenticate,
  authorize('creator'),
  asyncHandler(async (req, res) => {
    // Delegate to the application controller — inject requirementId from URL param
    req.body.requirementId = req.params.id;
    return appCtrl.apply(req, res);
  }),
);

export default router;
