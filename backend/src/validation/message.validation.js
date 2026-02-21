/**
 * @file message.validation.js
 * @description Zod schemas for messaging endpoints.
 */

import { z } from 'zod/v4';

/**
 * POST /messages
 *
 * • receiverId    – UUID of the message recipient
 * • content       – non-empty message text (max 5000 chars)
 * • requirementId – optional UUID of a related campaign
 */
export const sendMessageSchema = z.object({
  receiverId: z.uuid('Invalid receiver ID'),
  content: z.string().min(1, 'Message cannot be empty').max(5000),
  requirementId: z.uuid('Invalid requirement ID').optional(),
});
