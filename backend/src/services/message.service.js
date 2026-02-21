/**
 * @file message.service.js
 * @description Business logic for messaging between brands and creators.
 *
 * Provides:
 *   • sendMessage                – create a new message
 *   • getConversation            – get messages between two users
 *   • getConversationsForUser    – list all conversations for a user
 */

import { eq, or, and, desc, sql } from 'drizzle-orm';
import db from '../db/index.js';
import { messages, users } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Send a message from one user to another.
 *
 * @param {string} senderId      – UUID of the sender
 * @param {string} receiverId    – UUID of the receiver
 * @param {string} content       – message text
 * @param {string} [requirementId] – optional campaign context
 * @returns {Object} the created message row
 */
export async function sendMessage(senderId, receiverId, content, requirementId) {
  if (senderId === receiverId) {
    throw new AppError('Cannot send a message to yourself', 400);
  }

  // Verify receiver exists
  const [receiver] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, receiverId))
    .limit(1);

  if (!receiver) throw new AppError('Recipient not found', 404);

  const [msg] = await db
    .insert(messages)
    .values({
      senderId,
      receiverId,
      content,
      requirementId: requirementId || null,
    })
    .returning();

  return msg;
}

/**
 * Get messages between two users (conversation thread),
 * ordered oldest → newest for display.
 *
 * @param {string} userId   – the current user
 * @param {string} otherId  – the other participant
 * @returns {Object[]} array of message rows
 */
export async function getConversation(userId, otherId) {
  const rows = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      receiverId: messages.receiverId,
      requirementId: messages.requirementId,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(
      or(
        and(eq(messages.senderId, userId), eq(messages.receiverId, otherId)),
        and(eq(messages.senderId, otherId), eq(messages.receiverId, userId)),
      ),
    )
    .orderBy(messages.createdAt);

  return rows;
}

/**
 * Get all conversations for a user — grouped by the other participant.
 * Returns the latest message per conversation plus the other user's info.
 *
 * @param {string} userId – UUID of the current user
 * @returns {Object[]} conversations with last message and participant info
 */
export async function getConversationsForUser(userId) {
  // Get all messages where user is sender or receiver
  const allMessages = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      receiverId: messages.receiverId,
      requirementId: messages.requirementId,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(
      or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId),
      ),
    )
    .orderBy(desc(messages.createdAt));

  // Group by the "other" participant and take the latest message per conversation
  const conversationMap = new Map();
  for (const msg of allMessages) {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!conversationMap.has(otherId)) {
      conversationMap.set(otherId, msg);
    }
  }

  // Enrich with user info
  const conversations = [];
  for (const [otherId, lastMessage] of conversationMap) {
    const [otherUser] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, otherId))
      .limit(1);

    conversations.push({
      participantId: otherId,
      participant: otherUser || { id: otherId, firstName: 'Deleted', lastName: 'User', email: '', role: '' },
      lastMessage,
    });
  }

  return conversations;
}
