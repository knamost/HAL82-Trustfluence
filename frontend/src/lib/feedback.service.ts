/**
 * Feedback (ratings & reviews) API service
 */
import { apiGet, apiPost } from "./api-client";

export interface Rating {
  id: string;
  fromUserId: string;
  toUserId: string;
  score: number;
  createdAt: string;
}

export interface RatingsSummary {
  ratings: Rating[];
  avgRating: number;
  ratingCount: number;
}

export interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
}

/** Submit or update a rating */
export async function submitRating(payload: {
  toUserId: string;
  score: number;
}): Promise<Rating> {
  return apiPost<Rating>("/feedback/ratings", payload, true);
}

/** Get ratings for a user */
export async function getRatings(userId: string): Promise<RatingsSummary> {
  return apiGet<RatingsSummary>(`/feedback/ratings/${userId}`);
}

/** Submit a review */
export async function submitReview(payload: {
  toUserId: string;
  content: string;
}): Promise<Review> {
  return apiPost<Review>("/feedback/reviews", payload, true);
}

/** Get reviews for a user */
export async function getReviews(userId: string): Promise<Review[]> {
  return apiGet<Review[]>(`/feedback/reviews/${userId}`);
}
