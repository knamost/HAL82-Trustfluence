import { useState, useEffect, useCallback } from "react";
import { X, Plus, DollarSign, Users, TrendingUp, Briefcase, Loader2, CheckCircle2 } from "lucide-react";
import { listRequirements, createRequirement } from "../../api/requirement.api";
import { applyToRequirement, listMyApplications } from "../../api/application.api";
import { useAuth } from "../context/auth-context";
import { COMMON_NICHES } from "../../api/constants";

export function BrandRequirements() {
  const { isBrand, isCreator, isAuthenticated } = useAuth();
  const [selectedNiche, setSelectedNiche] = useState("");
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [applyModal, setApplyModal] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [applySuccess, setApplySuccess] = useState("");
  const [applyError, setApplyError] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Form state for create modal
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMinFollowers, setFormMinFollowers] = useState("");
  const [formMinEngagement, setFormMinEngagement] = useState("");
  const [formBudgetMin, setFormBudgetMin] = useState("");
  const [formBudgetMax, setFormBudgetMax] = useState("");

  const fetchReqs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listRequirements({
        niche: selectedNiche || undefined,
        minFollowers: minFollowers ? parseInt(minFollowers) : undefined,
        status: selectedStatus ? selectedStatus.toLowerCase() : undefined,
      });
      setReqs(data.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description || "",
        brand: r.brandName || r.brandId,
        niches: r.niches || [],
        minFollowers: r.minFollowers,
        minEngagement: r.minEngagementRate,
        budget: r.budgetMin && r.budgetMax ? `$${r.budgetMin.toLocaleString()} - $${r.budgetMax.toLocaleString()}` : "TBD",
        status: r.status === "open" ? "Open" : r.status === "closed" ? "Closed" : "Paused",
      })));
    } catch (err) {
      setError(err?.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, [selectedNiche, minFollowers, selectedStatus]);

  useEffect(() => {
    fetchReqs();
  }, [fetchReqs]);

  // Load already-applied requirement IDs for creators
  useEffect(() => {
    if (!isCreator) return;
    listMyApplications().then((apps) => {
      setAppliedIds(new Set(apps.map((a) => a.requirementId)));
    }).catch(() => {});
  }, [isCreator]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyModal) return;
    setApplyLoading(true);
    setApplyError("");
    setApplySuccess("");
    try {
      await applyToRequirement({
        requirementId: applyModal.id,
        coverLetter: coverLetter || undefined,
        proposedRate: proposedRate ? parseInt(proposedRate) : undefined,
      });
      setAppliedIds((prev) => new Set([...prev, applyModal.id]));
      setApplySuccess("Application submitted!");
      setTimeout(() => {
        setApplyModal(null);
        setCoverLetter("");
        setProposedRate("");
        setApplySuccess("");
      }, 1200);
    } catch (err) {
      setApplyError(err?.message || "Failed to apply");
    } finally {
      setApplyLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setCreateLoading(true);
    try {
      await createRequirement({
        title: formTitle,
        description: formDescription || undefined,
        minFollowers: formMinFollowers ? parseInt(formMinFollowers) : undefined,
        minEngagementRate: formMinEngagement ? parseFloat(formMinEngagement) : undefined,
        budgetMin: formBudgetMin ? parseInt(formBudgetMin) : undefined,
        budgetMax: formBudgetMax ? parseInt(formBudgetMax) : undefined,
      });
      setShowCreateModal(false);
      setFormTitle("");
      setFormDescription("");
      setFormMinFollowers("");
      setFormMinEngagement("");
      setFormBudgetMin("");
      setFormBudgetMax("");
      fetchReqs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create requirement");
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredRequirements = reqs;

  // Build dynamic niches list: merge COMMON_NICHES with niches found in campaigns
  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const campaignNiches = [...new Set(reqs.flatMap((r) => r.niches || []))];
  const allNiches = [...new Set([
    ...COMMON_NICHES.map((n) => n.toLowerCase()),
    ...campaignNiches.map((n) => n.toLowerCase()),
  ])].map(capitalize).sort();

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[#0A1628] mb-2" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              Browse Campaign Opportunities
            </h1>
            <p className="text-muted-foreground">
              Find the perfect campaign match for your content and audience.
            </p>
          </div>
          {isBrand && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-sm shrink-0 w-full sm:w-auto justify-center"
              style={{ fontWeight: 500 }}
            >
              <Plus className="w-4 h-4" />
              Create Requirement
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Filter</label>
              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="">All Niches</option>
                {allNiches.map((niche) => (
                  <option key={niche} value={niche}>{niche}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Min Followers</label>
              <input
                type="number"
                value={minFollowers}
                onChange={(e) => setMinFollowers(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
          {loading ? "Loading..." : `Showing ${filteredRequirements.length} campaign${filteredRequirements.length !== 1 ? "s" : ""}`}
          {error && !loading && <span className="ml-2 text-red-500">— {error}</span>}
        </div>

        {/* Requirements Cards */}
        <div className="space-y-4">
          {filteredRequirements.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm hover:shadow-md transition-all hover:border-[#2563EB]/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-[#0A1628]" style={{ fontSize: '1.125rem', fontWeight: 600 }}>{req.title}</h3>
                    <span
                      className={`px-2.5 py-1 rounded-full shrink-0 ${
                        req.status === "Open"
                          ? "bg-[#ECFDF5] text-[#059669]"
                          : "bg-gray-100 text-gray-500"
                      }`}
                      style={{ fontSize: '0.75rem', fontWeight: 500 }}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[#2563EB]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{req.brand}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[#059669]" style={{ fontWeight: 600 }}>
                  <DollarSign className="w-4 h-4" />
                  {req.budget}
                </div>
              </div>

              <p className="text-muted-foreground mb-4" style={{ lineHeight: 1.7 }}>{req.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {req.niches.map((niche) => (
                  <span
                    key={niche}
                    className="px-3 py-1 bg-[#EEF2FF] text-[#2563EB] rounded-full"
                    style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  >
                    {niche}
                  </span>
                ))}
              </div>

              {/* Requirements Row */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                  <Users className="w-4 h-4" />
                  Min {(req.minFollowers / 1000).toFixed(0)}K followers
                </div>
                <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                  <TrendingUp className="w-4 h-4" />
                  Min {req.minEngagement}% engagement
                </div>
                <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                  <Briefcase className="w-4 h-4" />
                  {req.brand}
                </div>
              </div>

              {req.status === "Open" && isAuthenticated && isCreator && (
                <div className="mt-4">
                  {appliedIds.has(req.id) ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#ECFDF5] text-[#059669] rounded-xl" style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      <CheckCircle2 className="w-4 h-4" /> Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => { setApplyModal(req); setCoverLetter(""); setProposedRate(""); setApplyError(""); setApplySuccess(""); }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors"
                      style={{ fontWeight: 500, fontSize: '0.875rem' }}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredRequirements.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-[#0A1628] mb-2" style={{ fontWeight: 600 }}>No campaigns found</h3>
            <p className="text-muted-foreground">Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Apply Now Modal */}
      {applyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#0A1628]" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                Apply to: {applyModal.title}
              </h2>
              <button onClick={() => setApplyModal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            {applySuccess ? (
              <div className="flex items-center gap-2 text-[#059669] py-8 justify-center" style={{ fontWeight: 500 }}>
                <CheckCircle2 className="w-5 h-5" /> {applySuccess}
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Cover Letter</label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell the brand why you're a great fit..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Proposed Rate ($)</label>
                  <input
                    type="number"
                    value={proposedRate}
                    onChange={(e) => setProposedRate(e.target.value)}
                    placeholder="Your rate for this campaign"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
                {applyError && <p className="text-red-500" style={{ fontSize: '0.875rem' }}>{applyError}</p>}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyModal(null)}
                    className="flex-1 px-4 py-3 border border-border rounded-xl hover:bg-gray-50 transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applyLoading}
                    className="flex-1 px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    style={{ fontWeight: 500 }}
                  >
                    {applyLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Application"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Requirement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#0A1628]" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create Campaign Requirement</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div>
                <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Campaign Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Summer Product Launch"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe your campaign requirements..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Min Followers</label>
                  <input
                    type="number"
                    value={formMinFollowers}
                    onChange={(e) => setFormMinFollowers(e.target.value)}
                    placeholder="50000"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Min Engagement %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formMinEngagement}
                    onChange={(e) => setFormMinEngagement(e.target.value)}
                    placeholder="3.5"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Budget Min ($)</label>
                  <input
                    type="number"
                    value={formBudgetMin}
                    onChange={(e) => setFormBudgetMin(e.target.value)}
                    placeholder="2000"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Budget Max ($)</label>
                  <input
                    type="number"
                    value={formBudgetMax}
                    onChange={(e) => setFormBudgetMax(e.target.value)}
                    placeholder="5000"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-border rounded-xl hover:bg-gray-50 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-60"
                  style={{ fontWeight: 500 }}
                >
                  {createLoading ? "Creating..." : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
