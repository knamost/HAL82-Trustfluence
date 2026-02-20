import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateRequirement } from '../validation/index.js';
import * as reqService from '../services/requirementService.js';

const router = Router();

// GET /requirements — list with filters (public)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await reqService.listRequirements(req.query);
    res.json(items);
  })
);

// POST /requirements — create (brand only)
router.post(
  '/',
  authenticate,
  authorize('brand'),
  asyncHandler(async (req, res) => {
    validateRequirement(req.body);
    const item = await reqService.createRequirement(req.user.id, req.body);
    res.status(201).json(item);
  })
);

// GET /requirements/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await reqService.getRequirementById(req.params.id);
    res.json(item);
  })
);

// PUT /requirements/:id (brand owner only)
router.put(
  '/:id',
  authenticate,
  authorize('brand'),
  asyncHandler(async (req, res) => {
    const item = await reqService.updateRequirement(req.params.id, req.user.id, req.body);
    res.json(item);
  })
);

// DELETE /requirements/:id (brand owner only)
router.delete(
  '/:id',
  authenticate,
  authorize('brand'),
  asyncHandler(async (req, res) => {
    const result = await reqService.deleteRequirement(req.params.id, req.user.id);
    res.json(result);
  })
);

export default router;
