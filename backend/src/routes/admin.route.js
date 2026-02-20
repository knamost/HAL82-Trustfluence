/**
 * @file routes/admin.js
 * @description Admin-only routes (requires admin role).
 *
 * GET    /admin/stats      — platform dashboard metrics
 * GET    /admin/users      — list/search users
 * DELETE /admin/users/:id  — delete a user
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import * as adminCtrl from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get('/stats', asyncHandler(adminCtrl.stats));
router.get('/users', asyncHandler(adminCtrl.listUsers));
router.delete('/users/:id', asyncHandler(adminCtrl.deleteUser));

export default router;
