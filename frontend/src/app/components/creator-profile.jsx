import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { Star, Users, TrendingUp, Instagram, Youtube, MessageCircle, ExternalLink, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { getCreator } from "../../api/creator.api";
import { getReviews, getRatings } from "../../api/feedback.api";
import { StarRating } from "./star-rating";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const platformIcons = {
  Instagram: Instagram,
  instagram: Instagram,
  YouTube: Youtube,
  youtube: Youtube,
  TikTok: MessageCircle,
  tiktok: MessageCircle,
};

export function CreatorProfile() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creator, setCreator] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingInfo, setRatingInfo] = useState({ avgRating: 0, ratingCount: 0 });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [profile, reviewsData, ratingsData] = await Promise.all([
          getCreator(id),
          getReviews(id).catch(() => []),
          getRatings(id).catch(() => ({ ratings: [], avgRating: 0, ratingCount: 0 })),
        ]);
        setCreator({
          name: profile.displayName,
          bio: profile.bio || "",
          platform: profile.platform || "",
          handle: profile.socialHandle || "",
          photo: profile.avatarUrl || "",
          followers: profile.followersCount,
          engagementRate: profile.engagementRate,
          niches: profile.niches || [],
          promotionTypes: profile.promotionTypes || [],
          rating: ratingsData.avgRating || 0,
          reviewCount: ratingsData.ratingCount || 0,
        });
        setRatingInfo({ avgRating: ratingsData.avgRating || 0, ratingCount: ratingsData.ratingCount || 0 });
        setReviews(reviewsData.map((r) => ({
          id: r.id,
          reviewerName: r.fromUserId,
          rating: 0,
          comment: r.content,
          date: r.createdAt,
        })));
      } catch (err) {
        setError(err?.message || "Failed to load creator profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const PlatformIcon = creator ? (platformIcons[creator.platform] || ExternalLink) : ExternalLink;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-[#0A1628] text-lg font-semibold mb-2">Failed to load profile</h2>
          <p className="text-muted-foreground mb-4">{error || "Creator not found"}</p>
          <Link to="/creators" className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Creators
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/creators" className="inline-flex items-center gap-2 text-muted-foreground hover:text-[#2563EB] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Creators
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <ImageWithFallback
              src={creator.photo}
              alt={creator.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-md"
            />
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-[#0A1628]" style={{ fontSize: '1.75rem', fontWeight: 700 }}>{creator.name}</h1>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EEF2FF] text-[#2563EB] rounded-full" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                  <PlatformIcon className="w-3.5 h-3.5" />
                  {creator.platform}
                </div>
              </div>
              <p className="text-[#2563EB] mb-3" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{creator.handle}</p>
              <p className="text-muted-foreground mb-4" style={{ lineHeight: 1.7 }}>{creator.bio}</p>

              {/* Niche Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {creator.niches.map((niche) => (
                  <span
                    key={niche}
                    className="px-3 py-1 bg-[#F1F5F9] text-[#0A1628] rounded-full"
                    style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  >
                    {niche}
                  </span>
                ))}
              </div>

              {/* Promotion Types */}
              <div className="flex flex-wrap gap-2">
                {creator.promotionTypes.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-[#EEF2FF] text-[#2563EB] rounded-full"
                    style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-border p-5 text-center shadow-sm">
            <Users className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <div className="text-[#0A1628]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {creator.followers >= 1000 ? `${(creator.followers / 1000).toFixed(0)}K` : creator.followers}
            </div>
            <div className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>Followers</div>
          </div>
          <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-xl p-5 text-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-white/80 mx-auto mb-2" />
            <div className="text-white" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{creator.engagementRate}%</div>
            <div className="text-white/80" style={{ fontSize: '0.8125rem' }}>Engagement Rate</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-5 text-center shadow-sm">
            <Star className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <div className="text-[#0A1628]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{creator.rating}</div>
            <div className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>Avg Rating</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-5 text-center shadow-sm">
            <MessageCircle className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <div className="text-[#0A1628]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{creator.reviewCount}</div>
            <div className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>Reviews</div>
          </div>
        </div>

        {/* Contact Button */}
        <div className="mb-6">
          <button className="w-full sm:w-auto px-8 py-3.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-sm" style={{ fontWeight: 500 }}>
            Send Proposal
          </button>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <h2 className="text-[#0A1628] mb-6" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Reviews ({reviews.length})
          </h2>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#0A1628]" style={{ fontWeight: 600 }}>{review.reviewerName}</span>
                  <span className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>
                    {new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <StarRating rating={review.rating} size={14} showValue={false} />
                <p className="text-muted-foreground mt-2" style={{ lineHeight: 1.7 }}>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
