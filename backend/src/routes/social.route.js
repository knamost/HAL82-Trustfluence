/**
 * @file routes/social.js
 * @description Social-media metrics routes.
 *
 * GET /social/:platform/:handle — fetch follower count & engagement (mock)
 */

import { Router } from 'express';
import * as socialCtrl from '../controllers/social.controller.js';

const router = Router();

router.get('/:platform/:handle', socialCtrl.getMetrics);

export default router;
