/**
 * @file routes/messages.route.js
 * @description Messaging routes.
 *
 * POST /messages           – send a message (authenticated)
 * GET  /messages           – list conversations (authenticated)
 * GET  /messages/:userId   – conversation thread (authenticated)
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { sendMessageSchema } from '../validation/message.validation.js';
import * as msgCtrl from '../controllers/message.controller.js';

const router = Router();

// All message routes require authentication
router.use(authenticate);

router.post('/', validate(sendMessageSchema), asyncHandler(msgCtrl.send));
router.get('/', asyncHandler(msgCtrl.listConversations));
router.get('/:userId', asyncHandler(msgCtrl.getConversation));

export default router;
