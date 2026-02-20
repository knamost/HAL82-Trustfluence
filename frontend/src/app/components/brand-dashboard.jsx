import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Building2, TrendingUp, Star, Briefcase,
  Settings, ChevronRight, BarChart3, Loader2, Plus, Trash2, Pause, Play, AlertCircle
} from "lucide-react";
import { getMyBrandProfile, upsertBrandProfile } from "../../api/brand.api";
import { listRequirements, createRequirement, updateRequirement, deleteRequirement } from "../../api/requirement.api";
import { getRatings, getReviews } from "../../api/feedback.api";
import { StarRating } from "./star-rating";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "../context/auth-context";

/* ── Section tabs ── */
const sections = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "profile", label: "Brand Profile", icon: Building2 },
  { id: "requirements", label: "Campaigns", icon: Briefcase },
  { id: "ratings", label: "Ratings", icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

export function BrandDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [brand, setBrand] = useState({ name: "My Brand", category: "", logo: "" });
  const [reviews, setReviews] = useState([]);
  const [myRequirements, setMyRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        let profile = null;
        try {
          profile = await getMyBrandProfile();
        } catch (profileErr) {
          if (profileErr?.status === 404) {
            setBrand(null);
            setLoading(false);
            return;
          }
          throw profileErr;
        }

        setBrand({
          name: profile.companyName,
          bio: profile.bio || "",
          logo: profile.logoUrl || "",
          website: profile.website || "",
          category: profile.category || "",
          rating: 0,
          reviewCount: 0,
        });

        if (user?.id) {
          const [ratingsData, reviewsData, reqs] = await Promise.all([
            getRatings(user.id).catch(() => ({ avgRating: 0, ratingCount: 0 })),
            getReviews(user.id).catch(() => []),
            listRequirements().catch(() => []),
          ]);
          setBrand((prev) => ({
            ...prev,
            rating: ratingsData.avgRating || 0,
            reviewCount: ratingsData.ratingCount || 0,
          }));
          setReviews(
            Array.isArray(reviewsData)
              ? reviewsData.map((r) => ({
                  id: r.id,
                  reviewerName: r.fromUserId || "User",
                  rating: 0,
                  comment: r.content,
                  date: r.createdAt,
                }))
              : []
          );
          const brandReqs = Array.isArray(reqs)
            ? reqs
                .filter((r) => r.brandId === user.id)
                .map((r) => ({
                  id: r.id,
                  title: r.title,
                  description: r.description || "",
                  niches: r.niches || [],
                  budget:
                    r.budgetMin != null && r.budgetMax != null
                      ? `$${r.budgetMin} - $${r.budgetMax}`
                      : "TBD",
                  budgetMin: r.budgetMin,
                  budgetMax: r.budgetMax,
                  minFollowers: r.minFollowers,
                  minEngagementRate: r.minEngagementRate,
                  status: r.status,
                }))
            : [];
          setMyRequirements(brandReqs);
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
      ) : !brand ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Briefcase className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-medium mb-1">No brand profile yet</p>
          <p className="text-muted-foreground text-sm">Set up your profile to get started.</p>
          <button
            onClick={() => setActiveSection("profile")}
            className="mt-4 px-6 py-2 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors"
            style={{ fontWeight: 500 }}
          >
            Create Profile
          </button>
        </div>
      ) : (
        <>
          {activeSection === "overview" && (
            <OverviewSection brand={brand} reviews={reviews} myRequirements={myRequirements} />
          )}
          {activeSection === "profile" && <ProfileSection brand={brand} setBrand={setBrand} />}
          {activeSection === "requirements" && (
            <RequirementsSection myRequirements={myRequirements} setMyRequirements={setMyRequirements} />
          )}
          {activeSection === "ratings" && <RatingsSection brand={brand} reviews={reviews} />}
          {activeSection === "settings" && <SettingsSection email={user?.email || ""} />}
        </>
      )}
    </div>
  );
}

/* ──────────────────────────── OVERVIEW ──────────────────────────── */
function OverviewSection({ brand, reviews, myRequirements }) {
  const openCampaigns = myRequirements.filter((r) => r.status === "open").length;
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Campaigns" value={String(openCampaigns)} icon={Briefcase} color="blue" sub={`${myRequirements.length} total`} />
        <StatCard label="Total Campaigns" value={String(myRequirements.length)} icon={TrendingUp} color="green" sub="All time" />
        <StatCard label="Avg Rating" value={brand.rating || "—"} icon={Star} color="yellow" sub={`${brand.reviewCount || 0} reviews`} />
        <StatCard label="Reviews" value={String(reviews.length)} icon={Star} color="orange" sub="From creators" />
      </div>

      {/* Latest Reviews */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[#0A1628]" style={{ fontWeight: 600 }}>Latest Reviews</h3>
        </div>
        <div className="space-y-4">
          {reviews.length === 0 && (
            <p className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>No reviews yet.</p>
          )}
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="w-9 h-9 bg-[#EEF2FF] rounded-full flex items-center justify-center shrink-0">
                <span className="text-[#2563EB]" style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                  {review.reviewerName?.charAt(0) || "U"}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#0A1628]" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {review.reviewerName}
                  </span>
                  <StarRating rating={review.rating} size={12} showValue={false} />
                </div>
                <p className="text-muted-foreground truncate" style={{ fontSize: "0.8125rem" }}>
                  {review.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[#0A1628]" style={{ fontWeight: 600 }}>Active Campaigns</h3>
          <Link to="/requirements" className="text-[#2563EB] flex items-center gap-1" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {myRequirements
            .filter((r) => r.status === "open")
            .slice(0, 3)
            .map((req) => (
              <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-[#2563EB]/20 transition-colors">
                <div className="min-w-0 mr-4">
                  <h4 className="text-[#0A1628] truncate" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {req.title}
                  </h4>
                  <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{req.budget}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          {myRequirements.filter((r) => r.status === "open").length === 0 && (
            <p className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>No active campaigns.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── PROFILE ──────────────────────────── */
function ProfileSection({ brand, setBrand }) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    name: brand.name || "",
    bio: brand.bio || "",
    logoUrl: brand.logo || "",
    website: brand.website || "",
    category: brand.category || "",
  });

  async function handleSave() {
    if (!form.name.trim()) {
      setMsg({ type: "error", text: "Company name is required." });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const updated = await upsertBrandProfile({
        companyName: form.name,
        bio: form.bio || undefined,
        logoUrl: form.logoUrl || undefined,
        website: form.website || undefined,
        category: form.category || undefined,
      });
      setBrand((prev) => ({
        ...prev,
        name: updated.companyName,
        bio: updated.bio || "",
        logo: updated.logoUrl || "",
        website: updated.website || "",
        category: updated.category || "",
      }));
      setMsg({ type: "success", text: "Brand profile updated successfully!" });
    } catch (err) {
      const text =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.map((e) => e.message).join(", ") ||
        err?.message ||
        "Failed to update profile. Please check your inputs.";
      setMsg({ type: "error", text });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {msg && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium ${
            msg.type === "success"
              ? "bg-[#ECFDF5] text-[#059669] border border-[#059669]/20"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {msg.text}
        </div>
      )}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-[#0A1628] mb-5" style={{ fontWeight: 600 }}>Brand Information</h3>
        <div className="flex items-center gap-4 mb-6">
          <ImageWithFallback src={form.logoUrl} alt={form.name} className="w-20 h-20 rounded-full object-cover" />
          <div>
            <p className="text-muted-foreground mb-1" style={{ fontSize: "0.75rem" }}>Enter a logo URL below</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
              Company Name <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your company name"
              className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
              Logo URL
            </label>
            <input
              value={form.logoUrl}
              onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              placeholder="Tell creators about your brand…"
              className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="">Select a category</option>
                <option value="technology">Technology</option>
                <option value="beauty">Beauty</option>
                <option value="fashion">Fashion</option>
                <option value="fitness">Fitness</option>
                <option value="food">Food</option>
                <option value="gaming">Gaming</option>
                <option value="travel">Travel</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="crypto">Crypto</option>
                <option value="animal">Animal</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                Website
              </label>
              <input
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>
          </div>

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

/* ──────────────────────────── CAMPAIGNS / REQUIREMENTS ──────────────────────────── */
function RequirementsSection({ myRequirements, setMyRequirements }) {
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    niches: "",
    minFollowers: "",
    minEngagementRate: "",
    budgetMin: "",
    budgetMax: "",
  });

  async function handleCreate() {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const req = await createRequirement({
        title: form.title,
        description: form.description || undefined,
        niches: form.niches ? form.niches.split(",").map((n) => n.trim()) : undefined,
        minFollowers: form.minFollowers ? Number(form.minFollowers) : undefined,
        minEngagementRate: form.minEngagementRate ? Number(form.minEngagementRate) : undefined,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      });
      setMyRequirements((prev) => [
        {
          id: req.id,
          title: req.title,
          description: req.description || "",
          niches: req.niches || [],
          budget: req.budgetMin != null && req.budgetMax != null ? `$${req.budgetMin} - $${req.budgetMax}` : "TBD",
          budgetMin: req.budgetMin,
          budgetMax: req.budgetMax,
          minFollowers: req.minFollowers,
          minEngagementRate: req.minEngagementRate,
          status: req.status,
        },
        ...prev,
      ]);
      setForm({ title: "", description: "", niches: "", minFollowers: "", minEngagementRate: "", budgetMin: "", budgetMax: "" });
      setShowCreate(false);
    } catch {
      /* ignore */
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleStatus(req) {
    const newStatus = req.status === "open" ? "paused" : "open";
    try {
      await updateRequirement(req.id, { status: newStatus });
      setMyRequirements((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: newStatus } : r)));
    } catch {
      /* ignore */
    }
  }

  async function handleDelete(id) {
    try {
      await deleteRequirement(id);
      setMyRequirements((prev) => prev.filter((r) => r.id !== id));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[#0A1628]" style={{ fontWeight: 600 }}>
          My Campaigns ({myRequirements.length})
        </h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors"
          style={{ fontSize: "0.875rem", fontWeight: 500 }}
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-[#2563EB]/30 p-6 shadow-sm space-y-4">
          <h4 className="text-[#0A1628]" style={{ fontWeight: 600 }}>Create Campaign</h4>
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Title *</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Campaign title" className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Campaign description" className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none" />
          </div>
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Niches (comma-separated)</label>
            <input value={form.niches} onChange={(e) => setForm((f) => ({ ...f, niches: e.target.value }))} placeholder="Fashion, Lifestyle, Tech" className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Min Followers</label>
              <input value={form.minFollowers} onChange={(e) => setForm((f) => ({ ...f, minFollowers: e.target.value }))} type="number" placeholder="10000" className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Min Engagement %</label>
              <input value={form.minEngagementRate} onChange={(e) => setForm((f) => ({ ...f, minEngagementRate: e.target.value }))} type="number" step="0.1" placeholder="3.0" className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Budget Min ($)</label>
              <input value={form.budgetMin} onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value }))} type="number" placeholder="500" className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Budget Max ($)</label>
              <input value={form.budgetMax} onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))} type="number" placeholder="5000" className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleCreate} disabled={creating || !form.title.trim()} className="w-full sm:w-auto px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-50" style={{ fontWeight: 500 }}>
              {creating ? "Creating…" : "Create Campaign"}
            </button>
            <button onClick={() => setShowCreate(false)} className="w-full sm:w-auto px-6 py-3 border border-border rounded-xl hover:bg-gray-50 transition-colors" style={{ fontWeight: 500 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Requirement List */}
      {myRequirements.length === 0 && !showCreate && (
        <div className="bg-white rounded-xl border border-border p-10 text-center shadow-sm">
          <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-[#0A1628]" style={{ fontWeight: 600 }}>No campaigns yet</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "0.875rem" }}>Create your first campaign to start finding creators.</p>
        </div>
      )}
      {myRequirements.map((req) => (
        <div key={req.id} className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-[#0A1628]" style={{ fontWeight: 600 }}>{req.title}</h4>
            <StatusBadge status={req.status} />
          </div>
          {req.description && (
            <p className="text-muted-foreground mb-3" style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>{req.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            {(req.niches || []).map((niche) => (
              <span key={niche} className="px-2.5 py-0.5 bg-[#EEF2FF] text-[#2563EB] rounded-full" style={{ fontSize: "0.75rem" }}>
                {niche}
              </span>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-border">
            <span className="text-[#059669]" style={{ fontWeight: 600, fontSize: "0.875rem" }}>{req.budget}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleStatus(req)}
                className="p-2 rounded-lg border border-border hover:bg-gray-50 transition-colors"
                title={req.status === "open" ? "Pause campaign" : "Resume campaign"}
              >
                {req.status === "open" ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-green-600" />}
              </button>
              <button
                onClick={() => handleDelete(req.id)}
                className="p-2 rounded-lg border border-border hover:bg-red-50 transition-colors"
                title="Delete campaign"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────── RATINGS ──────────────────────────── */
function RatingsSection({ brand, reviews }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-[#0A1628]" style={{ fontSize: "3rem", fontWeight: 700 }}>{brand.rating || "—"}</div>
          <div>
            <StarRating rating={brand.rating || 0} size={20} showValue={false} />
            <p className="text-muted-foreground mt-1" style={{ fontSize: "0.8125rem" }}>
              {brand.reviewCount || 0} total reviews
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-[#0A1628] mb-5" style={{ fontWeight: 600 }}>All Reviews</h3>
        <div className="space-y-5">
          {reviews.length === 0 && (
            <p className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>No reviews yet.</p>
          )}
          {reviews.map((review) => (
            <div key={review.id} className="pb-5 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#0A1628]" style={{ fontWeight: 600 }}>{review.reviewerName}</span>
                <span className="text-muted-foreground" style={{ fontSize: "0.8125rem" }}>
                  {new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <StarRating rating={review.rating} size={14} showValue={false} />
              <p className="text-muted-foreground mt-2" style={{ lineHeight: 1.7, fontSize: "0.875rem" }}>{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── SETTINGS ──────────────────────────── */
function SettingsSection({ email }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-[#0A1628] mb-5" style={{ fontWeight: 600 }}>Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Email</label>
            <input defaultValue={email} className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Password</label>
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
            { label: "New applications", desc: "Get notified when a creator applies to your campaign" },
            { label: "New reviews", desc: "Get notified when someone leaves a review" },
            { label: "Campaign updates", desc: "Get notified about campaign performance" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div>
                <div className="text-[#0A1628]" style={{ fontWeight: 500, fontSize: "0.875rem" }}>{item.label}</div>
                <div className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{item.desc}</div>
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

/* ──────────────────────────── HELPERS ──────────────────────────── */
function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    blue: { bg: "bg-[#EEF2FF]", text: "text-[#2563EB]" },
    green: { bg: "bg-[#ECFDF5]", text: "text-[#059669]" },
    yellow: { bg: "bg-[#FFFBEB]", text: "text-yellow-500" },
    orange: { bg: "bg-[#FFF7ED]", text: "text-[#D97706]" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground" style={{ fontSize: "0.8125rem" }}>{label}</span>
        <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      <div className="text-[#0A1628]" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
      <div className="text-muted-foreground mt-1" style={{ fontSize: "0.75rem" }}>{sub}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    open: { bg: "bg-[#ECFDF5]", text: "text-[#059669]", label: "Open" },
    paused: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", label: "Paused" },
    closed: { bg: "bg-gray-100", text: "text-gray-500", label: "Closed" },
  };
  const s = map[status] || map.open;
  return (
    <span className={`px-2.5 py-1 ${s.bg} ${s.text} rounded-full`} style={{ fontSize: "0.75rem", fontWeight: 500 }}>
      {s.label}
    </span>
  );
}
