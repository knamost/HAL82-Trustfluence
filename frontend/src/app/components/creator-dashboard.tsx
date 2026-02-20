import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Users, TrendingUp, Eye, Star, User, Briefcase,
  Settings, ChevronRight, BarChart3, Loader2, AlertCircle
} from "lucide-react";
import { getMyCreatorProfile, upsertCreatorProfile } from "../../lib/creators.service";
import { listRequirements } from "../../lib/requirements.service";
import { getRatings, getReviews } from "../../lib/feedback.service";
import { StarRating } from "./star-rating";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "../context/auth-context";

/* ── Section tabs shown inside the content area ── */
const sections = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "profile", label: "My Profile", icon: User },
  { id: "requirements", label: "Campaigns", icon: Briefcase },
  { id: "ratings", label: "Ratings", icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

export function CreatorDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [creator, setCreator] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [matchingRequirements, setMatchingRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const profile = await getMyCreatorProfile();
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
          rating: 0,
          reviewCount: 0,
        });

        if (user?.id) {
          const [ratingsData, reviewsData, reqs] = await Promise.all([
            getRatings(user.id).catch(() => ({ avgRating: 0, ratingCount: 0 })),
            getReviews(user.id).catch(() => []),
            listRequirements({ status: "open" }).catch(() => []),
          ]);
          setCreator((prev: any) => ({
            ...prev,
            rating: (ratingsData as any).avgRating || 0,
            reviewCount: (ratingsData as any).ratingCount || 0,
          }));
          setReviews(Array.isArray(reviewsData) ? reviewsData.map((r: any) => ({
            id: r.id,
            reviewerName: r.fromUserId || "User",
            rating: 0,
            comment: r.content,
            date: r.createdAt,
          })) : []);
          setMatchingRequirements(Array.isArray(reqs) ? reqs.map((r: any) => ({
            id: r.id,
            title: r.title,
            brand: r.brandId,
            niches: r.niches || [],
            budget: r.budgetMin && r.budgetMax ? `$${r.budgetMin} - $${r.budgetMax}` : "TBD",
            status: "Open",
          })) : []);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      {/* Section tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border border-border p-1.5 overflow-x-auto">
        {sections.map((s) => {
          const Icon = s.icon;
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon size={16} />
              {s.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-red-600 mb-1 font-medium">Failed to load dashboard</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      ) : !creator ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <User className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-medium mb-1">No creator profile yet</p>
          <p className="text-muted-foreground text-sm">Set up your profile to get started.</p>
        </div>
      ) : (
        <>
          {activeSection === "overview" && <OverviewSection creator={creator} reviews={reviews} matchingRequirements={matchingRequirements} />}
          {activeSection === "profile" && <ProfileSection creator={creator} setCreator={setCreator} />}
          {activeSection === "requirements" && <RequirementsSection matchingRequirements={matchingRequirements} />}
          {activeSection === "ratings" && <RatingsSection creator={creator} reviews={reviews} />}
          {activeSection === "settings" && <SettingsSection email={user?.email || ""} />}
        </>
      )}
    </div>
  );
}

function OverviewSection({ creator, reviews, matchingRequirements }: { creator: any; reviews: any[]; matchingRequirements: any[] }) {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>Followers</span>
            <div className="w-8 h-8 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-[#2563EB]" />
            </div>
          </div>
          <div className="text-[#0A1628]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{creator.followers ? `${(creator.followers / 1000).toFixed(0)}K` : "—"}</div>
          <div className="text-[#059669] mt-1" style={{ fontSize: '0.75rem', fontWeight: 500 }}>+2.3% this month</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>Engagement Rate</span>
            <div className="w-8 h-8 bg-[#ECFDF5] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#059669]" />
            </div>
          </div>
          <div className="text-[#0A1628]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{creator.engagementRate ? `${creator.engagementRate}%` : "—"}</div>
          <div className="text-[#059669] mt-1" style={{ fontSize: '0.75rem', fontWeight: 500 }}>+0.5% this month</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>Profile Views</span>
            <div className="w-8 h-8 bg-[#FFF7ED] rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-[#D97706]" />
            </div>
          </div>
          <div className="text-[#0A1628]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>1,847</div>
          <div className="text-[#059669] mt-1" style={{ fontSize: '0.75rem', fontWeight: 500 }}>+12% this month</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>Avg Rating</span>
            <div className="w-8 h-8 bg-[#FFFBEB] rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
          <div className="text-[#0A1628]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{creator.rating || "—"}</div>
          <div className="text-muted-foreground mt-1" style={{ fontSize: '0.75rem' }}>{creator.reviewCount || 0} total reviews</div>
        </div>
      </div>

      {/* Latest Reviews */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[#0A1628]" style={{ fontWeight: 600 }}>Latest Reviews</h3>
          <button className="text-[#2563EB] flex items-center gap-1" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="w-9 h-9 bg-[#EEF2FF] rounded-full flex items-center justify-center shrink-0">
                <span className="text-[#2563EB]" style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                  {review.reviewerName.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#0A1628]" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{review.reviewerName}</span>
                  <StarRating rating={review.rating} size={12} showValue={false} />
                </div>
                <p className="text-muted-foreground truncate" style={{ fontSize: '0.8125rem' }}>{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matching Requirements */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[#0A1628]" style={{ fontWeight: 600 }}>Matching Open Campaigns</h3>
          <Link to="/requirements" className="text-[#2563EB] flex items-center gap-1" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {matchingRequirements.slice(0, 3).map((req) => (
            <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-[#2563EB]/20 transition-colors">
              <div className="min-w-0 mr-4">
                <h4 className="text-[#0A1628] truncate" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{req.title}</h4>
                <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>{req.brand} &middot; {req.budget}</p>
              </div>
              <span className="px-2.5 py-1 bg-[#ECFDF5] text-[#059669] rounded-full shrink-0" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                Open
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ creator, setCreator }: { creator: any; setCreator: React.Dispatch<React.SetStateAction<any>> }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: creator.name || "",
    bio: creator.bio || "",
    platform: creator.platform || "Instagram",
    handle: creator.handle || "",
  });

  async function handleSave() {
    setSaving(true);
    try {
      await upsertCreatorProfile({
        displayName: form.name,
        bio: form.bio,
        platform: form.platform.toLowerCase() as any,
        socialHandle: form.handle,
      });
      setCreator((prev: any) => ({ ...prev, ...form }));
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-[#0A1628] mb-5" style={{ fontWeight: 600 }}>Profile Information</h3>
        <div className="flex items-center gap-4 mb-6">
          <ImageWithFallback
            src={creator.photo}
            alt={creator.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <button className="px-4 py-2 border border-border rounded-lg text-[#0A1628] hover:bg-gray-50 transition-colors" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              Change Photo
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Display Name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Platform</label>
              <select value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]">
                <option>Instagram</option>
                <option>YouTube</option>
                <option>TikTok</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Handle</label>
              <input value={form.handle} onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full sm:w-auto px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-50" style={{ fontWeight: 500 }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RequirementsSection({ matchingRequirements }: { matchingRequirements: any[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[#0A1628]" style={{ fontWeight: 600 }}>
          Matching Campaigns ({matchingRequirements.length})
        </h3>
        <Link to="/requirements" className="text-[#2563EB]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          Browse All
        </Link>
      </div>
      {matchingRequirements.map((req) => (
        <div key={req.id} className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-[#0A1628]" style={{ fontWeight: 600 }}>{req.title}</h4>
            <span className="px-2.5 py-1 bg-[#ECFDF5] text-[#059669] rounded-full" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Open</span>
          </div>
          <p className="text-[#2563EB] mb-2" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{req.brand}</p>
          <p className="text-muted-foreground mb-3" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{req.description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {req.niches.map((niche: string) => (
              <span key={niche} className="px-2.5 py-0.5 bg-[#EEF2FF] text-[#2563EB] rounded-full" style={{ fontSize: '0.75rem' }}>{niche}</span>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-border">
            <span className="text-[#059669]" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{req.budget}</span>
            <button className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors" style={{ fontWeight: 500, fontSize: '0.875rem' }}>
              Apply
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function RatingsSection({ creator, reviews }: { creator: any; reviews: any[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-[#0A1628]" style={{ fontSize: '3rem', fontWeight: 700 }}>{creator.rating}</div>
          <div>
            <StarRating rating={creator.rating} size={20} showValue={false} />
            <p className="text-muted-foreground mt-1" style={{ fontSize: '0.8125rem' }}>
              {creator.reviewCount} total reviews
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-[#0A1628] mb-5" style={{ fontWeight: 600 }}>All Reviews</h3>
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="pb-5 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#0A1628]" style={{ fontWeight: 600 }}>{review.reviewerName}</span>
                <span className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>
                  {new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <StarRating rating={review.rating} size={14} showValue={false} />
              <p className="text-muted-foreground mt-2" style={{ lineHeight: 1.7, fontSize: '0.875rem' }}>{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ email }: { email: string }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-[#0A1628] mb-5" style={{ fontWeight: 600 }}>Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
            <input defaultValue={email} className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
            <input type="password" defaultValue="********" className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
          </div>
          <button className="w-full sm:w-auto px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors" style={{ fontWeight: 500 }}>
            Update Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-[#0A1628] mb-5" style={{ fontWeight: 600 }}>Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { label: "New campaign matches", desc: "Get notified when a new campaign matches your profile" },
            { label: "New reviews", desc: "Get notified when someone leaves a review" },
            { label: "Proposal updates", desc: "Get notified about proposal status changes" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div>
                <div className="text-[#0A1628]" style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.label}</div>
                <div className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>{item.desc}</div>
              </div>
              <label className="relative inline-flex cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[#2563EB] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
