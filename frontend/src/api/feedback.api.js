import { apiGet, apiPost } from "./index";

/* ── Ratings ── */

/**
 * POST /feedback/ratings — rate a user (authenticated)
 * @param {{ toUserId: string, score: number }} data
 */
export async function submitRating(data) {
  return apiPost("/feedback/ratings", data);
}

/**
 * GET /feedback/ratings/:userId — get ratings summary for a user
 */
export async function getRatings(userId) {
  return apiGet(`/feedback/ratings/${userId}`);
}

/* ── Reviews ── */

/**
 * POST /feedback/reviews — review a user (authenticated)
 * @param {{ toUserId: string, content: string }} data
 */
export async function submitReview(data) {
  return apiPost("/feedback/reviews", data);
}

/**
 * GET /feedback/reviews/:userId — get reviews for a user
 */
export async function getReviews(userId) {
  return apiGet(`/feedback/reviews/${userId}`);
}
