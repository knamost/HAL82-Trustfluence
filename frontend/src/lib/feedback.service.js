/**
 * Feedback (ratings & reviews) API service
 */
import { apiGet, apiPost } from "./api-client";

/** Submit or update a rating */
export async function submitRating(payload) {
  return apiPost("/feedback/ratings", payload, true);
}

/** Get ratings for a user */
export async function getRatings(userId) {
  return apiGet(`/feedback/ratings/${userId}`);
}

/** Submit a review */
export async function submitReview(payload) {
  return apiPost("/feedback/reviews", payload, true);
}

/** Get reviews for a user */
export async function getReviews(userId) {
  return apiGet(`/feedback/reviews/${userId}`);
}
