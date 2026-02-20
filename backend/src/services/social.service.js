/**
 * @file socialService.js
 * @description Social-media metrics service.
 *
 * Reads self-reported data from the creator_profiles table first.
 * Falls back to mock data when no matching profile exists.
 *
 * Creators update their own metrics via PUT /creators/profile or
 * PUT /social/metrics.
 */

import { eq, and, ilike } from 'drizzle-orm';
import db from '../db/index.js';
import { creatorProfiles } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const SUPPORTED_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'twitter'];

/**
 * Fetch social metrics for a creator by platform + handle.
 * Returns stored (self-reported) data when available, otherwise mock.
 */
export async function fetchSocialMetrics(platform, handle) {
  const key = platform.toLowerCase();

  if (!SUPPORTED_PLATFORMS.includes(key)) {
    throw new AppError(
      `Unsupported platform "${platform}". Supported: ${SUPPORTED_PLATFORMS.join(', ')}`,
      400,
    );
  }

  // Look up creator profile in the database
  const [profile] = await db
    .select({
      displayName: creatorProfiles.displayName,
      followersCount: creatorProfiles.followersCount,
      engagementRate: creatorProfiles.engagementRate,
      updatedAt: creatorProfiles.updatedAt,
    })
    .from(creatorProfiles)
    .where(
      and(
        ilike(creatorProfiles.platform, key),
        ilike(creatorProfiles.socialHandle, handle),
      ),
    )
    .limit(1);

  if (profile && (profile.followersCount || profile.engagementRate)) {
    return {
      platform: key,
      handle,
      followersCount: profile.followersCount ?? 0,
      engagementRate: profile.engagementRate ?? 0,
      source: 'self-reported',
      updatedAt: profile.updatedAt?.toISOString() ?? null,
    };
  }

  // Fallback: mock data (useful during development)
  return generateMockMetrics(key, handle);
}

/**
 * Update the authenticated creator's social metrics.
 *
 * @param {string} userId – UUID of the authenticated user
 * @param {Object} data   – { followersCount?, engagementRate?, platform?, socialHandle? }
 * @returns {Object} updated profile row
 */
export async function updateSocialMetrics(userId, data) {
  const allowed = {};
  if (data.followersCount !== undefined) allowed.followersCount = data.followersCount;
  if (data.engagementRate !== undefined) allowed.engagementRate = data.engagementRate;
  if (data.platform) allowed.platform = data.platform;
  if (data.socialHandle) allowed.socialHandle = data.socialHandle;

  if (Object.keys(allowed).length === 0) {
    throw new AppError('No social metrics fields provided', 400);
  }

  const [existing] = await db
    .select({ id: creatorProfiles.id })
    .from(creatorProfiles)
    .where(eq(creatorProfiles.userId, userId))
    .limit(1);

  if (!existing) {
    throw new AppError('Creator profile not found. Create a profile first.', 404);
  }

  const [updated] = await db
    .update(creatorProfiles)
    .set({ ...allowed, updatedAt: new Date() })
    .where(eq(creatorProfiles.userId, userId))
    .returning();

  return updated;
}

/* ── Mock helpers (development fallback) ─────────────────────── */

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const PLATFORM_RANGES = {
  instagram: { followers: [500, 5_000_000], engagement: [0.5, 8] },
  tiktok: { followers: [1000, 10_000_000], engagement: [1, 15] },
  youtube: { followers: [100, 50_000_000], engagement: [0.2, 5] },
  twitter: { followers: [100, 2_000_000], engagement: [0.1, 4] },
};

function generateMockMetrics(platform, handle) {
  const ranges = PLATFORM_RANGES[platform];
  const followers = randomInt(ranges.followers[0], ranges.followers[1]);
  const engagement = (
    Math.random() * (ranges.engagement[1] - ranges.engagement[0]) + ranges.engagement[0]
  ).toFixed(2);

  return {
    platform,
    handle,
    followersCount: followers,
    engagementRate: Number(engagement),
    source: 'mock',
    fetchedAt: new Date().toISOString(),
  };
}
