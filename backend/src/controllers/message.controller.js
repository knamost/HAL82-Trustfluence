/**
 * @file message.controller.js
 * @description Handles HTTP request / response for messaging.
 *
 * Endpoints:
 *   POST /messages               – send a message
 *   GET  /messages               – list conversations
 *   GET  /messages/:userId       – conversation with a specific user
 */

import * as messageService from '../services/message.service.js';

/** POST /messages — send a message */
export async function send(req, res) {
  const msg = await messageService.sendMessage(
    req.user.id,
    req.body.receiverId,
    req.body.content,
    req.body.requirementId,
  );
  res.status(201).json(msg);
}

/** GET /messages — list all conversations for the current user */
export async function listConversations(req, res) {
  const conversations = await messageService.getConversationsForUser(req.user.id);
  res.json(conversations);
}

/** GET /messages/:userId — get conversation thread with a specific user */
export async function getConversation(req, res) {
  const msgs = await messageService.getConversation(req.user.id, req.params.userId);
  res.json(msgs);
}
