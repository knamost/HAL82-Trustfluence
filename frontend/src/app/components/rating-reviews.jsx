import { useState, useEffect } from "react";
import { Send, Loader2, ChevronDown } from "lucide-react";
import { StarRatingInput } from "./star-rating";
import { useAuth } from "../context/auth-context";
import { submitRating, submitReview } from "../../api/feedback.api";
import { listAcceptedPartners } from "../../api/application.api";

export function RatingReviews() {
  const { isAuthenticated, user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState("");

  // Accepted partners for dropdown
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingPartners(true);
    listAcceptedPartners()
      .then((data) => setPartners(data || []))
      .catch(() => setPartners([]))
      .finally(() => setLoadingPartners(false));
  }, [isAuthenticated]);

  const selectedPartner = partners.find((p) => p.userId === toUserId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;
    setError("");

    if (!isAuthenticated || !toUserId) {
      setError("You must be logged in and select a user to submit a review.");
      return;
    }

    setApiLoading(true);
    try {
      await Promise.all([
        submitRating({ toUserId, score: rating }),
        submitReview({ toUserId, content: comment.trim() }),
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
  };

  const partnerLabel = user?.role === "creator" ? "Brand" : "Creator";

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

          {!isAuthenticated ? (
            <p className="text-amber-600" style={{ fontSize: '0.875rem' }}>
              You must be logged in to submit a rating or review.
            </p>
          ) : loadingPartners ? (
            <div className="flex items-center gap-2 text-muted-foreground py-6">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading your connections…
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2" style={{ fontSize: '0.9375rem' }}>
                No accepted collaborations yet.
              </p>
              <p className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>
                You can only review {user?.role === "creator" ? "brands" : "creators"} once your application has been accepted.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Select {partnerLabel} to Review
                </label>
                <div className="relative">
                  <select
                    value={toUserId}
                    onChange={(e) => setToUserId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] appearance-none pr-10"
                  >
                    <option value="">— Choose a {partnerLabel.toLowerCase()} —</option>
                    {partners.map((p) => (
                      <option key={p.userId} value={p.userId}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

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
                  placeholder={`Share your experience working with this ${partnerLabel.toLowerCase()}…`}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={rating === 0 || !comment.trim() || !toUserId || apiLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontWeight: 500 }}
              >
                <Send className="w-4 h-4" />
                {apiLoading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <h2 className="text-[#0A1628] mb-4" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            Where do reviews appear?
          </h2>
          <p className="text-muted-foreground" style={{ lineHeight: 1.7 }}>
            Reviews and ratings you submit will appear on the recipient's public profile page. Visit a creator or brand profile to see their reviews.
          </p>
        </div>
      </div>
    </div>
  );
}
