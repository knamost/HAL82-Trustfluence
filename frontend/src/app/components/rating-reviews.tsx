import { useState } from "react";
import { Star, Send } from "lucide-react";
import { StarRatingInput, StarRating } from "./star-rating";
import { reviews as mockReviews } from "./mock-data";
import { useAuth } from "../context/auth-context";
import { submitRating, submitReview } from "../../lib/feedback.service";

export function RatingReviews() {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [allReviews, setAllReviews] = useState(mockReviews);
  const [submitted, setSubmitted] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;
    setError("");

    if (isAuthenticated && toUserId.trim()) {
      // Use real API
      setApiLoading(true);
      try {
        await Promise.all([
          submitRating({ toUserId: toUserId.trim(), score: rating }),
          submitReview({ toUserId: toUserId.trim(), content: comment.trim() }),
        ]);
        setSubmitted(true);
        setRating(0);
        setComment("");
        setToUserId("");
        setTimeout(() => setSubmitted(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit");
      } finally {
        setApiLoading(false);
      }
    } else {
      // Mock/demo mode
      const newReview = {
        id: String(allReviews.length + 1),
        reviewerName: "You",
        rating,
        comment: comment.trim(),
        date: new Date().toISOString().split("T")[0],
      };
      setAllReviews([newReview, ...allReviews]);
      setRating(0);
      setComment("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-[#0A1628] mb-2" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
          Ratings & Reviews
        </h1>
        <p className="text-muted-foreground mb-8">
          Share your experience and help build trust in the community.
        </p>

        {/* Write a Review */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-8 shadow-sm">
          <h2 className="text-[#0A1628] mb-5" style={{ fontSize: '1.125rem', fontWeight: 600 }}>Write a Review</h2>

          {submitted && (
            <div className="mb-5 p-4 bg-[#ECFDF5] text-[#059669] rounded-xl" style={{ fontSize: '0.875rem' }}>
              Review submitted successfully! Thank you for your feedback.
            </div>
          )}

          {error && (
            <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl" style={{ fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isAuthenticated && (
              <div>
                <label className="block mb-2 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  User ID to Review
                </label>
                <input
                  type="text"
                  value={toUserId}
                  onChange={(e) => setToUserId(e.target.value)}
                  placeholder="Enter the user's UUID"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>
            )}
            <div>
              <label className="block mb-2 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Your Rating
              </label>
              <StarRatingInput value={rating} onChange={setRating} size={28} />
              {rating > 0 && (
                <p className="mt-1 text-muted-foreground" style={{ fontSize: '0.8125rem' }}>
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your experience working with this creator or brand..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={rating === 0 || !comment.trim() || apiLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontWeight: 500 }}
            >
              <Send className="w-4 h-4" />
              {apiLoading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Existing Reviews */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <h2 className="text-[#0A1628] mb-6" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            All Reviews ({allReviews.length})
          </h2>
          <div className="space-y-6">
            {allReviews.map((review) => (
              <div key={review.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#EEF2FF] rounded-full flex items-center justify-center">
                      <span className="text-[#2563EB]" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {review.reviewerName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-[#0A1628]" style={{ fontWeight: 600 }}>{review.reviewerName}</span>
                  </div>
                  <span className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>
                    {new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="ml-12">
                  <StarRating rating={review.rating} size={14} showValue={false} />
                  <p className="text-muted-foreground mt-2" style={{ lineHeight: 1.7 }}>{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
