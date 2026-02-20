import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateBrandProfile } from '../validation/index.js';
import * as brandService from '../services/brandService.js';

const router = Router();

// GET /brands — list with filters (public)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const brands = await brandService.listBrands(req.query);
    res.json(brands);
  })
);

// GET /brands/profile — own profile (protected, brand only)
router.get(
  '/profile',
  authenticate,
  authorize('brand'),
  asyncHandler(async (req, res) => {
    const profile = await brandService.getBrandProfile(req.user.id);
    res.json(profile);
  })
);

// PUT /brands/profile — create or update own profile (protected, brand only)
router.put(
  '/profile',
  authenticate,
  authorize('brand'),
  asyncHandler(async (req, res) => {
    validateBrandProfile(req.body);
    const profile = await brandService.upsertBrandProfile(req.user.id, req.body);
    res.json(profile);
  })
);

// GET /brands/:id — public view by profile id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const profile = await brandService.getBrandById(req.params.id);
    res.json(profile);
  })
);

export default router;
