/**
 * @file routes/auth.js
 * @description Authentication routes.
 *
 * POST /auth/register  — create account (validated by registerSchema)
 * POST /auth/login     — get JWT       (validated by loginSchema)
 * GET  /auth/me        — whoami        (requires valid JWT)
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validation/auth.validation.js';
import * as authCtrl from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(authCtrl.register));
router.post('/login', validate(loginSchema), asyncHandler(authCtrl.login));
router.get('/me', authenticate, asyncHandler(authCtrl.me));

export default router;
