/**
 * @file message.api.js
 * @description API service for messaging between brands and creators.
 */

import { apiGet, apiPost } from "./index";

/**
 * Send a message to another user.
 * @param {{ receiverId: string, content: string, requirementId?: string }} data
 */
export async function sendMessage(data) {
  return apiPost("/api/messages", data);
}

/**
 * List all conversations for the current user.
 * Each conversation includes the other participant's info and the last message.
 */
export async function listConversations() {
  return apiGet("/api/messages");
}

/**
 * Get the full conversation thread with a specific user.
 * @param {string} userId – UUID of the other participant
 */
export async function getConversation(userId) {
  return apiGet(`/api/messages/${userId}`);
}
