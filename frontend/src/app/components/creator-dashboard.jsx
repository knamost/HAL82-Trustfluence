import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  Users, TrendingUp, Eye, Star, User, Briefcase,
  Settings, ChevronRight, BarChart3, Loader2, AlertCircle,
  Pencil, Save, X, Plus, Send, Clock, CheckCircle2,
  XCircle, ArrowLeft, DollarSign, FileText, Sparkles,
  MapPin, Target, CalendarDays, ExternalLink, Undo2
} from "lucide-react";
import { getMyCreatorProfile, upsertCreatorProfile } from "../../api/creator.api";
import { listRequirements } from "../../api/requirement.api";
import { getRatings, getReviews } from "../../api/feedback.api";
import { applyToRequirement, listMyApplications, withdrawApplication } from "../../api/application.api";
import { StarRating } from "./star-rating";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "../context/auth-context";

/* ── Section tabs shown inside the content area ── */
const sections = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "profile", label: "My Profile", icon: User },
  { id: "requirements", label: "Campaigns", icon: Briefcase },
  { id: "applications", label: "My Applications", icon: FileText },
  { id: "ratings", label: "Ratings", icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

export function CreatorDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [creator, setCreator] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [matchingRequirements, setMatchingRequirements] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        let profile = null;
        try {
          profile = await getMyCreatorProfile();
        } catch (profileErr) {
          // 404 means no profile yet — that's fine, show the empty state
          if (profileErr?.status === 404) {
            setCreator(null);
            setLoading(false);
            return;
          }
          throw profileErr;
        }

        // Use backend model fields directly
        setCreator({
          ...profile,
          rating: 0,
          reviewCount: 0,
        });

        if (user?.id) {
          const [ratingsData, reviewsData, reqs, apps] = await Promise.all([
            getRatings(user.id).catch(() => ({ avgRating: 0, ratingCount: 0 })),
            getReviews(user.id).catch(() => []),
            listRequirements({ status: "open" }).catch(() => []),
            listMyApplications().catch(() => []),
          ]);

          setCreator((prev) => ({
            ...prev,
            rating: ratingsData.avgRating || 0,
            reviewCount: ratingsData.ratingCount || 0,
          }));

          setReviews(Array.isArray(reviewsData) ? reviewsData.map((r) => ({
            id: r.id,
            reviewerName: r.fromUserId || "User",
            rating: 0,
            comment: r.content,
            date: r.createdAt,
          })) : []);

          setMatchingRequirements(Array.isArray(reqs) ? reqs.map((r) => ({
            id: r.id,
            title: r.title,
            brand: r.brandName || r.brandId,
            niches: r.niches || [],
            budget: r.budgetMin && r.budgetMax ? `$${r.budgetMin} - $${r.budgetMax}` : "TBD",
            budgetMin: r.budgetMin,
            budgetMax: r.budgetMax,
            minFollowers: r.minFollowers,
            minEngagementRate: r.minEngagementRate,
            description: r.description || "",
            status: "Open",
            createdAt: r.createdAt,
          })) : []);

          setMyApplications(Array.isArray(apps) ? apps : []);
        }
      } catch (err) {
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
        <CreateProfileSection onCreated={(profile) => {
          setCreator({ ...profile, rating: 0, reviewCount: 0 });
        }} />
      ) : (
        <>
          {activeSection === "overview" && <OverviewSection creator={creator} setCreator={setCreator} reviews={reviews} matchingRequirements={matchingRequirements} />}
          {activeSection === "profile" && <ProfileSection creator={creator} setCreator={setCreator} />}
          {activeSection === "requirements" && (
            <RequirementsSection
              matchingRequirements={matchingRequirements}
              myApplications={myApplications}
              setMyApplications={setMyApplications}
              onApplied={() => setActiveSection("applications")}
            />
          )}
          {activeSection === "applications" && (
            <MyApplicationsSection
              myApplications={myApplications}
              setMyApplications={setMyApplications}
            />
          )}
          {activeSection === "ratings" && <RatingsSection creator={creator} reviews={reviews} />}
          {activeSection === "settings" && <SettingsSection email={user?.email || ""} />}
        </>
      )}
    </div>
  );
}

/* ── Create Profile Section (shown when no profile exists) ── */
function CreateProfileSection({ onCreated }) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    platform: "instagram",
    socialHandle: "",
    avatarUrl: "",
    followersCount: "",
    engagementRate: "",
    niches: [],
  });

  const nicheOptions = [
    "Beauty", "Tech", "Fitness", "Fashion", "Food", "Travel",
    "Gaming", "Music", "Education", "Lifestyle", "Health", "Finance",
  ];

  function toggleNiche(niche) {
    setForm((f) => ({
      ...f,
      niches: f.niches.includes(niche)
        ? f.niches.filter((n) => n !== niche)
        : [...f.niches, niche],
    }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.displayName.trim()) {
      setFormError("Display name is required.");
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      const payload = {
        displayName: form.displayName.trim(),
        bio: form.bio.trim() || undefined,
        platform: form.platform || undefined,
        socialHandle: form.socialHandle.trim() || undefined,
        avatarUrl: form.avatarUrl.trim() || undefined,
        followersCount: form.followersCount ? Number(form.followersCount) : undefined,
        engagementRate: form.engagementRate ? Number(form.engagementRate) : undefined,
        niches: form.niches.length > 0 ? form.niches : undefined,
      };
      const created = await upsertCreatorProfile(payload);
      onCreated(created);
    } catch (err) {
      setFormError(err?.message || "Failed to create profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-[#2563EB]" />
          </div>
          <h2 className="text-[#0A1628] text-xl mb-2" style={{ fontWeight: 700 }}>
            Create Your Creator Profile
          </h2>
          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
            Set up your profile so brands can discover and connect with you.
          </p>
        </div>

        {formError && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-5">
          {/* Avatar URL */}
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              Avatar URL
            </label>
            <input
              type="text"
              placeholder="https://example.com/avatar.jpg"
              value={form.avatarUrl}
              onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              style={{ fontSize: '0.875rem' }}
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              Display Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Your public name"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              style={{ fontSize: '0.875rem' }}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Bio</label>
            <textarea
              placeholder="Tell brands about yourself..."
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
              style={{ fontSize: '0.875rem' }}
            />
          </div>

          {/* Platform + Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                style={{ fontSize: '0.875rem' }}
              >
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="twitter">Twitter / X</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Handle</label>
              <input
                type="text"
                placeholder="@yourhandle"
                value={form.socialHandle}
                onChange={(e) => setForm((f) => ({ ...f, socialHandle: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                style={{ fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {/* Followers + Engagement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Followers Count</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 50000"
                value={form.followersCount}
                onChange={(e) => setForm((f) => ({ ...f, followersCount: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                style={{ fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Engagement Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g. 4.5"
                value={form.engagementRate}
                onChange={(e) => setForm((f) => ({ ...f, engagementRate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                style={{ fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {/* Niches */}
          <div>
            <label className="block mb-2 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              Niches <span className="text-muted-foreground font-normal">(select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {nicheOptions.map((niche) => {
                const selected = form.niches.includes(niche.toLowerCase());
                return (
                  <button
                    type="button"
                    key={niche}
                    onClick={() => toggleNiche(niche.toLowerCase())}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      selected
                        ? "bg-[#2563EB] text-white border-[#2563EB]"
                        : "bg-white text-muted-foreground border-border hover:border-[#2563EB]/40 hover:text-[#2563EB]"
                    }`}
                  >
                    {niche}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
            style={{ fontWeight: 600, fontSize: '0.9375rem' }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Creating Profile…
              </span>
            ) : (
              "Create Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function OverviewSection({ creator, setCreator, reviews, matchingRequirements }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    followersCount: creator.followersCount || 0,
    engagementRate: creator.engagementRate || 0,
  });

  function startEditing() {
    setEditForm({
      followersCount: creator.followersCount || 0,
      engagementRate: creator.engagementRate || 0,
    });
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  async function handleSaveMetrics() {
    setSaving(true);
    try {
      const updated = await upsertCreatorProfile({
        displayName: creator.displayName,
        followersCount: Number(editForm.followersCount),
        engagementRate: Number(editForm.engagementRate),
      });
      if (updated) {
        setCreator((prev) => ({ ...prev, ...updated }));
      }
      setEditing(false);
    } catch (err) {
      console.error("Failed to save metrics:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="flex items-center justify-between">
        <h3 className="text-[#0A1628]" style={{ fontWeight: 600, fontSize: '1rem' }}>Your Stats</h3>
        {!editing ? (
          <button
            onClick={startEditing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/30 rounded-lg hover:bg-[#EEF2FF] transition-colors"
            style={{ fontSize: '0.8125rem', fontWeight: 500 }}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Stats
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={cancelEditing}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              style={{ fontSize: '0.8125rem', fontWeight: 500 }}
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              onClick={handleSaveMetrics}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
              style={{ fontSize: '0.8125rem', fontWeight: 500 }}
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Followers Card */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>Followers</span>
            <div className="w-8 h-8 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-[#2563EB]" />
            </div>
          </div>
          {editing ? (
            <input
              type="number"
              min="0"
              value={editForm.followersCount}
              onChange={(e) => setEditForm((f) => ({ ...f, followersCount: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[#2563EB]/30 bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] text-[#0A1628]"
              style={{ fontSize: '1.125rem', fontWeight: 600 }}
              placeholder="e.g. 50000"
            />
          ) : (
            <>
              <div className="text-[#0A1628]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {creator.followersCount ? creator.followersCount.toLocaleString() : "—"}
              </div>
              <div className="text-muted-foreground mt-1" style={{ fontSize: '0.75rem' }}>Total followers</div>
            </>
          )}
        </div>

        {/* Engagement Rate Card */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>Engagement Rate</span>
            <div className="w-8 h-8 bg-[#ECFDF5] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#059669]" />
            </div>
          </div>
          {editing ? (
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={editForm.engagementRate}
                onChange={(e) => setEditForm((f) => ({ ...f, engagementRate: e.target.value }))}
                className="w-full px-3 py-2 pr-8 rounded-lg border border-[#059669]/30 bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] text-[#0A1628]"
                style={{ fontSize: '1.125rem', fontWeight: 600 }}
                placeholder="e.g. 4.5"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>%</span>
            </div>
          ) : (
            <>
              <div className="text-[#0A1628]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {creator.engagementRate ? `${creator.engagementRate}%` : "—"}
              </div>
              <div className="text-muted-foreground mt-1" style={{ fontSize: '0.75rem' }}>Average engagement</div>
            </>
          )}
        </div>

        {/* Profile Views Card (read-only) */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>Profile Views</span>
            <div className="w-8 h-8 bg-[#FFF7ED] rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-[#D97706]" />
            </div>
          </div>
          <div className="text-[#0A1628]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>1,847</div>
          <div className="text-muted-foreground mt-1" style={{ fontSize: '0.75rem' }}>Last 30 days</div>
        </div>

        {/* Avg Rating Card (read-only) */}
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

/* ── Profile Section ── */
function ProfileSection({ creator, setCreator }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: creator.displayName || "",
    bio: creator.bio || "",
    platform: creator.platform || "Instagram",
    socialHandle: creator.socialHandle || "",
    avatarUrl: creator.avatarUrl || "",
  });

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await upsertCreatorProfile(form);
      if (updated) {
        setCreator((prev) => ({
          ...prev,
          ...updated,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-[#0A1628] mb-5" style={{ fontWeight: 600 }}>
          Profile Information
        </h3>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <ImageWithFallback
            src={form.avatarUrl || creator.avatarUrl}
            alt={form.displayName}
            className="w-20 h-20 rounded-full object-cover"
          />
        </div>

        {/* Avatar URL Input */}
        <div className="mb-6">
          <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
            Avatar URL
          </label>
          <input
            type="text"
            placeholder="https://example.com/avatar.jpg"
            value={form.avatarUrl}
            onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
        </div>

        {/* Display Name */}
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
              Display Name
            </label>
            <input
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
            />
          </div>

          {/* Platform + Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option>Instagram</option>
                <option>YouTube</option>
                <option>TikTok</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Handle</label>
              <input
                value={form.socialHandle}
                onChange={(e) => setForm((f) => ({ ...f, socialHandle: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
            style={{ fontWeight: 500 }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Requirements Section (with Apply Now) ── */
function RequirementsSection({ matchingRequirements, myApplications, setMyApplications, onApplied }) {
  const [applyingTo, setApplyingTo] = useState(null);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(null);

  const appliedIds = new Set((myApplications || []).map((a) => a.requirementId));

  async function handleApply(reqId) {
    setApplyingTo(reqId);
    setApplyError("");
    setApplySuccess("");
    try {
      const app = await applyToRequirement({
        requirementId: reqId,
        coverLetter: coverLetter.trim() || undefined,
        proposedRate: proposedRate ? Number(proposedRate) : undefined,
      });
      setMyApplications((prev) => [app, ...prev]);
      setApplySuccess("Application submitted successfully!");
      setCoverLetter("");
      setProposedRate("");
      setShowApplyModal(null);
      setTimeout(() => setApplySuccess(""), 3000);
    } catch (err) {
      setApplyError(err?.message || "Failed to apply. You may have already applied.");
      setTimeout(() => setApplyError(""), 4000);
    } finally {
      setApplyingTo(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[#0A1628]" style={{ fontWeight: 600 }}>
          Open Campaigns ({matchingRequirements.length})
        </h3>
        <Link to="/requirements" className="text-[#2563EB]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          Browse All
        </Link>
      </div>

      {applySuccess && (
        <div className="px-4 py-3 rounded-xl bg-[#ECFDF5] text-[#059669] border border-[#059669]/20 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {applySuccess}
        </div>
      )}
      {applyError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium flex items-center gap-2">
          <XCircle className="w-4 h-4" /> {applyError}
        </div>
      )}

      {matchingRequirements.length === 0 && (
        <div className="bg-white rounded-xl border border-border p-10 text-center shadow-sm">
          <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-[#0A1628]" style={{ fontWeight: 600 }}>No open campaigns right now</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "0.875rem" }}>Check back later for new opportunities.</p>
        </div>
      )}

      {matchingRequirements.map((req) => {
        const hasApplied = appliedIds.has(req.id);
        return (
          <div key={req.id} className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-[#0A1628]" style={{ fontWeight: 600 }}>{req.title}</h4>
              <span className="px-2.5 py-1 bg-[#ECFDF5] text-[#059669] rounded-full" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Open</span>
            </div>
            {req.description && (
              <p className="text-muted-foreground mb-3" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{req.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-3">
              {(req.niches || []).map((niche) => (
                <span key={niche} className="px-2.5 py-0.5 bg-[#EEF2FF] text-[#2563EB] rounded-full" style={{ fontSize: '0.75rem' }}>{niche}</span>
              ))}
            </div>
            {/* Campaign details */}
            <div className="flex flex-wrap gap-4 mb-3 text-muted-foreground" style={{ fontSize: '0.8125rem' }}>
              {req.minFollowers > 0 && (
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {req.minFollowers.toLocaleString()}+ followers</span>
              )}
              {req.minEngagementRate > 0 && (
                <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {req.minEngagementRate}%+ engagement</span>
              )}
              {req.budget !== "TBD" && (
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {req.budget}</span>
              )}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-[#059669]" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{req.budget}</span>
              {hasApplied ? (
                <span className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-default" style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                  <CheckCircle2 className="w-4 h-4" /> Applied
                </span>
              ) : (
                <button
                  onClick={() => setShowApplyModal(req.id)}
                  disabled={applyingTo === req.id}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
                  style={{ fontWeight: 500, fontSize: '0.875rem' }}
                >
                  {applyingTo === req.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Applying…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Apply Now</>
                  )}
                </button>
              )}
            </div>

            {/* Apply Modal */}
            {showApplyModal === req.id && (
              <div className="mt-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#2563EB]/20 space-y-3">
                <h5 className="text-[#0A1628]" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Apply to "{req.title}"</h5>
                <div>
                  <label className="block mb-1 text-[#0A1628]" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Cover Letter (optional)</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell the brand why you're a great fit…"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
                    style={{ fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#0A1628]" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Proposed Rate (USD, optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={proposedRate}
                    onChange={(e) => setProposedRate(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    style={{ fontSize: '0.8125rem' }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApply(req.id)}
                    disabled={applyingTo === req.id}
                    className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
                    style={{ fontWeight: 500, fontSize: '0.8125rem' }}
                  >
                    {applyingTo === req.id ? "Submitting…" : "Submit Application"}
                  </button>
                  <button
                    onClick={() => { setShowApplyModal(null); setCoverLetter(""); setProposedRate(""); }}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ fontWeight: 500, fontSize: '0.8125rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── My Applications Section ── */
function MyApplicationsSection({ myApplications, setMyApplications }) {
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [msg, setMsg] = useState(null);

  async function handleWithdraw(appId) {
    setWithdrawingId(appId);
    setMsg(null);
    try {
      await withdrawApplication(appId);
      setMyApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: "withdrawn" } : a))
      );
      setMsg({ type: "success", text: "Application withdrawn." });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Failed to withdraw application." });
      setTimeout(() => setMsg(null), 4000);
    } finally {
      setWithdrawingId(null);
    }
  }

  const statusConfig = {
    pending: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", icon: Clock, label: "Pending" },
    accepted: { bg: "bg-[#ECFDF5]", text: "text-[#059669]", icon: CheckCircle2, label: "Accepted" },
    rejected: { bg: "bg-red-50", text: "text-red-500", icon: XCircle, label: "Rejected" },
    withdrawn: { bg: "bg-gray-100", text: "text-gray-500", icon: Undo2, label: "Withdrawn" },
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[#0A1628]" style={{ fontWeight: 600 }}>
        My Applications ({myApplications.length})
      </h3>

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          msg.type === "success" ? "bg-[#ECFDF5] text-[#059669] border border-[#059669]/20" : "bg-red-50 text-red-600 border border-red-200"
        }`}>
          {msg.text}
        </div>
      )}

      {myApplications.length === 0 && (
        <div className="bg-white rounded-xl border border-border p-10 text-center shadow-sm">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-[#0A1628]" style={{ fontWeight: 600 }}>No applications yet</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "0.875rem" }}>
            Browse open campaigns and apply to get started.
          </p>
        </div>
      )}

      {myApplications.map((app) => {
        const status = statusConfig[app.status] || statusConfig.pending;
        const StatusIcon = status.icon;
        return (
          <div key={app.id} className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-[#0A1628]" style={{ fontWeight: 600 }}>
                  {app.requirementTitle || "Campaign"}
                </h4>
                <p className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>
                  Applied {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <span className={`flex items-center gap-1 px-2.5 py-1 ${status.bg} ${status.text} rounded-full`} style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                <StatusIcon className="w-3 h-3" /> {status.label}
              </span>
            </div>

            {app.coverLetter && (
              <p className="text-muted-foreground mb-2" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                {app.coverLetter}
              </p>
            )}

            {app.proposedRate && (
              <p className="text-[#059669] mb-2" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Proposed rate: ${app.proposedRate}
              </p>
            )}

            {/* Budget info from joined requirement */}
            {(app.requirementBudgetMin != null || app.requirementBudgetMax != null) && (
              <p className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>
                Campaign budget: ${app.requirementBudgetMin || 0} – ${app.requirementBudgetMax || 0}
              </p>
            )}

            {app.status === "pending" && (
              <div className="flex justify-end pt-3 border-t border-border mt-3">
                <button
                  onClick={() => handleWithdraw(app.id)}
                  disabled={withdrawingId === app.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  {withdrawingId === app.id ? "Withdrawing…" : "Withdraw"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Ratings Section ── */
function RatingsSection({ creator, reviews }) {
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

/* ── Settings Section ── */
function SettingsSection({ email }) {
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
    </div>
  );
}
