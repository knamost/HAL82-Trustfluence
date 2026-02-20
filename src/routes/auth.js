import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRegister, validateLogin } from '../validation/index.js';
import * as authService from '../services/authService.js';

const router = Router();

// POST /auth/register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    validateRegister(req.body);
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  })
);

// POST /auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    validateLogin(req.body);
    const result = await authService.loginUser(req.body);
    res.json(result);
  })
);

// GET /auth/me  (protected)
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  })
);

export default router;
