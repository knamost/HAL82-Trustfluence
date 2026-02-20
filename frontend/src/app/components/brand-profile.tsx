import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, Globe, Tag, Loader2, AlertCircle } from "lucide-react";
import { getBrand } from "../../lib/brands.service";
import { getReviews, getRatings, type Review, type RatingsSummary } from "../../lib/feedback.service";
import { listRequirements, type Requirement } from "../../lib/requirements.service";
import { StarRating } from "./star-rating";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface BrandView {
  name: string;
  logo: string;
  website: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  trustScore: number;
}

interface ReqView {
  id: string;
  title: string;
  description: string;
  niches: string[];
  minFollowers: number | null;
  minEngagement: number | null;
  budget: string;
  status: string;
}

interface ReviewView {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export function BrandProfile() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [brand, setBrand] = useState<BrandView | null>(null);
  const [openReqs, setOpenReqs] = useState<ReqView[]>([]);
  const [reviews, setReviews] = useState<ReviewView[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [profile, ratingsData, reviewsData, reqs] = await Promise.all([
          getBrand(id!),
          getRatings(id!).catch(() => ({ ratings: [], avgRating: 0, ratingCount: 0 })),
          getReviews(id!).catch(() => []),
          listRequirements({ status: "open" }).catch(() => []),
        ]);
        const rInfo = ratingsData as RatingsSummary;
        setBrand({
          name: profile.companyName,
          logo: profile.logoUrl || "",
          website: profile.website || "",
          category: profile.category || "",
          description: profile.bio || "",
          rating: rInfo.avgRating || 0,
          reviewCount: rInfo.ratingCount || 0,
          trustScore: Math.round((rInfo.avgRating || 0) * 20),
        });
        setOpenReqs((reqs as Requirement[]).filter((r) => r.brandId === profile.userId).map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description || "",
          niches: r.niches || [],
          minFollowers: r.minFollowers,
          minEngagement: r.minEngagementRate,
          budget: r.budgetMin && r.budgetMax ? `$${r.budgetMin.toLocaleString()} - $${r.budgetMax.toLocaleString()}` : "TBD",
          status: r.status,
        })));
        setReviews((reviewsData as Review[]).map((r) => ({
          id: r.id,
          reviewerName: r.fromUserId,
          rating: 0,
          comment: r.content,
          date: r.createdAt,
        })));
      } catch (err: any) {
        setError(err?.message || "Failed to load brand profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-[#0A1628] text-lg font-semibold mb-2">Failed to load brand</h2>
          <p className="text-muted-foreground mb-4">{error || "Brand not found"}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-[#2563EB] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Brand Header Card */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <ImageWithFallback
              src={brand.logo}
              alt={brand.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-md"
            />
            <div className="flex-1">
              <h1 className="text-[#0A1628] mb-2" style={{ fontSize: '1.75rem', fontWeight: 700 }}>{brand.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                  <Globe className="w-4 h-4" />
                  <a href={brand.website} className="text-[#2563EB] hover:underline">{brand.website.replace("https://", "")}</a>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F1F5F9] text-[#0A1628] rounded-full" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                  <Tag className="w-3.5 h-3.5" />
                  {brand.category}
                </div>
              </div>
              <p className="text-muted-foreground" style={{ lineHeight: 1.7 }}>{brand.description}</p>
            </div>
          </div>
        </div>

        {/* Rating & Trust Score */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Overall Rating */}
          <div className="bg-white rounded-2xl border border-border p-6 text-center shadow-sm">
            <h3 className="text-muted-foreground mb-3" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Overall Rating</h3>
            <div className="text-[#0A1628] mb-2" style={{ fontSize: '3rem', fontWeight: 700 }}>{brand.rating}</div>
            <StarRating rating={brand.rating} size={22} showValue={false} />
            <p className="text-muted-foreground mt-2" style={{ fontSize: '0.8125rem' }}>
              Based on {brand.reviewCount} reviews
            </p>
          </div>

          {/* Trust Score */}
          <div className="bg-white rounded-2xl border border-border p-6 text-center shadow-sm">
            <h3 className="text-muted-foreground mb-3" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Trust Score</h3>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-28 h-28" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke={brand.trustScore >= 80 ? "#059669" : brand.trustScore >= 60 ? "#D97706" : "#DC2626"}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(brand.trustScore / 100) * 327} 327`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute">
                <div style={{ fontSize: '1.75rem', fontWeight: 700 }} className={brand.trustScore >= 80 ? "text-[#059669]" : "text-[#D97706]"}>
                  {brand.trustScore}
                </div>
                <div className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>out of 100</div>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#ECFDF5] text-[#059669] rounded-full" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Brand
            </div>
          </div>
        </div>

        {/* Open Campaign Requirements */}
        {openReqs.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-6 shadow-sm">
            <h2 className="text-[#0A1628] mb-5" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Open Campaigns ({openReqs.length})
            </h2>
            <div className="space-y-4">
              {openReqs.map((req) => (
                <div key={req.id} className="p-5 rounded-xl border border-border hover:border-[#2563EB]/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-[#0A1628]" style={{ fontWeight: 600 }}>{req.title}</h3>
                    <span className="px-2.5 py-1 bg-[#ECFDF5] text-[#059669] rounded-full shrink-0" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      Open
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{req.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {req.niches.map((niche) => (
                      <span key={niche} className="px-2 py-0.5 bg-[#F1F5F9] text-[#0A1628] rounded" style={{ fontSize: '0.75rem' }}>
                        {niche}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-muted-foreground" style={{ fontSize: '0.8125rem' }}>
                    <span>Min Followers: {(req.minFollowers / 1000).toFixed(0)}K</span>
                    <span>Min Engagement: {req.minEngagement}%</span>
                    <span className="text-[#059669]" style={{ fontWeight: 500 }}>Budget: {req.budget}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews from Creators */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <h2 className="text-[#0A1628] mb-6" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Creator Reviews ({reviews.length})
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
