import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { Search, Star, Users, TrendingUp, Filter, X, Loader2, AlertCircle } from "lucide-react";
import { listCreators } from "../../api/creator.api";
import { COMMON_NICHES, PLATFORMS } from "../../api/constants";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function CreatorDiscovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [minEngagement, setMinEngagement] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listCreators({
        search: searchQuery || undefined,
        niche: selectedNiche || undefined,
        minFollowers: minFollowers ? parseInt(minFollowers) : undefined,
        minEngagement: minEngagement ? parseFloat(minEngagement) : undefined,
      });
      setCreators(data);
    } catch (err) {
      setError(err?.message || "Failed to load creators");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedNiche, minFollowers, minEngagement]);

  // Debounced fetch on filter changes
  useEffect(() => {
    const timer = setTimeout(fetchCreators, 400);
    return () => clearTimeout(timer);
  }, [fetchCreators]);

  // Client-side platform filter (API doesn't support it server-side)
  const filteredCreators = selectedPlatform
    ? creators.filter((c) => c.platform?.toLowerCase() === selectedPlatform.toLowerCase())
    : creators;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedNiche("");
    setSelectedPlatform("");
    setMinFollowers("");
    setMinEngagement("");
  };

  const hasActiveFilters = selectedNiche || selectedPlatform || minFollowers || minEngagement;

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#0A1628] mb-2" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            Discover Creators
          </h1>
          <p className="text-muted-foreground">
            Find verified creators with real engagement metrics for your next campaign.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators by name or handle..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border transition-colors flex items-center gap-2 ${
                showFilters || hasActiveFilters ? "border-[#2563EB] bg-[#EEF2FF] text-[#2563EB]" : "border-border bg-white text-muted-foreground hover:border-[#2563EB]/30"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-border">
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Niche</label>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                >
                  <option value="">All Niches</option>
                  {COMMON_NICHES.map((niche) => (
                    <option key={niche} value={niche}>{niche}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Platform</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                >
                  <option value="">All Platforms</option>
                  {PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>{platform}</option>
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
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Min Engagement %</label>
                <input
                  type="number"
                  step="0.1"
                  value={minEngagement}
                  onChange={(e) => setMinEngagement(e.target.value)}
                  placeholder="e.g. 3.5"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
              <span className="text-muted-foreground" style={{ fontSize: '0.8125rem' }}>Active filters:</span>
              {selectedNiche && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EEF2FF] text-[#2563EB] rounded-full" style={{ fontSize: '0.75rem' }}>
                  {selectedNiche}
                  <button onClick={() => setSelectedNiche("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedPlatform && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EEF2FF] text-[#2563EB] rounded-full" style={{ fontSize: '0.75rem' }}>
                  {selectedPlatform}
                  <button onClick={() => setSelectedPlatform("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {minFollowers && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EEF2FF] text-[#2563EB] rounded-full" style={{ fontSize: '0.75rem' }}>
                  {(parseInt(minFollowers) / 1000).toFixed(0)}K+ followers
                  <button onClick={() => setMinFollowers("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {minEngagement && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EEF2FF] text-[#2563EB] rounded-full" style={{ fontSize: '0.75rem' }}>
                  {minEngagement}%+ engagement
                  <button onClick={() => setMinEngagement("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-[#2563EB] hover:underline ml-2" style={{ fontSize: '0.8125rem' }}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
          {loading ? "Searching..." : error ? (
            <span className="text-red-500">{error}</span>
          ) : `Showing ${filteredCreators.length} creator${filteredCreators.length !== 1 ? "s" : ""}`}
        </div>

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-[#0A1628] mb-2" style={{ fontWeight: 600 }}>Failed to load creators</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchCreators}
              className="px-6 py-2.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors"
              style={{ fontWeight: 500 }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Creator Grid */}
        {!loading && !error && filteredCreators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCreators.map((creator) => (
              <Link
                key={creator.id}
                to={`/creators/${creator.id}`}
                className="group bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-[#2563EB]/20"
              >
                <div className="flex items-center gap-4 mb-4">
                  <ImageWithFallback
                    src={creator.avatarUrl || ""}
                    alt={creator.displayName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="text-[#0A1628] truncate group-hover:text-[#2563EB] transition-colors" style={{ fontWeight: 600 }}>
                      {creator.displayName}
                    </h3>
                    <span className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                      {creator.niches?.[0] || creator.platform || "Creator"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1" style={{ fontSize: '0.6875rem' }}>
                      <Users className="w-3 h-3" />
                      Followers
                    </div>
                    <div className="text-[#0A1628]" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {creator.followersCount >= 1000 ? `${(creator.followersCount / 1000).toFixed(0)}K` : creator.followersCount}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1" style={{ fontSize: '0.6875rem' }}>
                      <TrendingUp className="w-3 h-3" />
                      Engagement
                    </div>
                    <div className="px-2 py-0.5 bg-[#EEF2FF] text-[#2563EB] rounded-md inline-block" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {Number(creator.engagementRate).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1" style={{ fontSize: '0.6875rem' }}>
                      <Star className="w-3 h-3" />
                      Rating
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{creator.avgRating?.toFixed(1) ?? "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(creator.niches || []).map((niche) => (
                    <span key={niche} className="px-2 py-0.5 bg-[#F1F5F9] text-muted-foreground rounded" style={{ fontSize: '0.6875rem' }}>
                      {niche}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        ) : !loading && !error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-[#0A1628] mb-2" style={{ fontWeight: 600 }}>No creators found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or search query.</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors"
              style={{ fontWeight: 500 }}
            >
              Clear Filters
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
