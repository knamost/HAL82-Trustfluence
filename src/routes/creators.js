import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateCreatorProfile } from '../validation/index.js';
import * as creatorService from '../services/creatorService.js';

const router = Router();

// GET /creators — list with filters (public)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const creators = await creatorService.listCreators(req.query);
    res.json(creators);
  })
);

// GET /creators/profile — own profile (protected, creator only)
router.get(
  '/profile',
  authenticate,
  authorize('creator'),
  asyncHandler(async (req, res) => {
    const profile = await creatorService.getCreatorProfile(req.user.id);
    res.json(profile);
  })
);

// PUT /creators/profile — create or update own profile (protected, creator only)
router.put(
  '/profile',
  authenticate,
  authorize('creator'),
  asyncHandler(async (req, res) => {
    validateCreatorProfile(req.body);
    const profile = await creatorService.upsertCreatorProfile(req.user.id, req.body);
    res.json(profile);
  })
);

// GET /creators/:id — public view by profile id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const profile = await creatorService.getCreatorById(req.params.id);
    res.json(profile);
  })
);

export default router;
