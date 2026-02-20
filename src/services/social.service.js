/**
 * @file socialService.js
 * @description Mock social-media metrics fetcher.
 *
 * In production, replace the `fetchSocialMetrics` function with real
 * API calls to one or more of these:
 *   • Instagram Graph API  — followers, engagement, reach
 *   • TikTok API           — followers, likes, video views
 *   • YouTube Data API     — subscribers, view count
 *   • Twitter / X API      — followers, impressions
 *
 * The current implementation returns randomised but realistic-looking
 * data so the rest of the app can be developed and tested without
 * needing API keys.
 */

/** Generate a random integer between min and max (inclusive). */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const PLATFORM_RANGES = {
  instagram: { followers: [500, 5_000_000], engagement: [0.5, 8] },
  tiktok: { followers: [1000, 10_000_000], engagement: [1, 15] },
  youtube: { followers: [100, 50_000_000], engagement: [0.2, 5] },
  twitter: { followers: [100, 2_000_000], engagement: [0.1, 4] },
};

export function fetchSocialMetrics(platform, handle) {
  const key = platform.toLowerCase();
  const ranges = PLATFORM_RANGES[key];

  if (!ranges) {
    return {
      platform,
      handle,
      error: `Unsupported platform "${platform}". Supported: ${Object.keys(PLATFORM_RANGES).join(', ')}`,
    };
  }

  const followers = randomInt(ranges.followers[0], ranges.followers[1]);
  const engagement = (Math.random() * (ranges.engagement[1] - ranges.engagement[0]) + ranges.engagement[0]).toFixed(2);

  return {
    platform: key,
    handle,
    followersCount: followers,
    engagementRate: Number(engagement),
    fetchedAt: new Date().toISOString(),
    note: 'Mock data — replace with real API integration in production',
  };
}
