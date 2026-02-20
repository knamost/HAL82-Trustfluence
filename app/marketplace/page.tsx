'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Creator {
  id: string;
  name: string;
  bio: string;
  niche: string;
  followers: number;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  avatarUrl?: string;
}

const NICHES = ['all', 'tech', 'fashion', 'food', 'gaming', 'beauty', 'travel', 'fitness'];

export default function MarketplacePage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [niche, setNiche] = useState('all');
  const [minFollowers, setMinFollowers] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (niche !== 'all') params.set('niche', niche);
    if (minFollowers) params.set('minFollowers', minFollowers);

    setLoading(true);
    fetch(`/api/creators?${params}`)
      .then(r => r.json())
      .then(data => { setCreators(data); })
      .catch(() => { setCreators([]); })
      .finally(() => setLoading(false));
  }, [niche, minFollowers]);

  const formatFollowers = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n.toString();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Creator Marketplace</h1>
          <p className="text-gray-600">Discover and connect with creators across every niche</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Niche</label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map(n => (
                <button
                  key={n}
                  onClick={() => setNiche(n)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${niche === n ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {n.charAt(0).toUpperCase() + n.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Followers</label>
            <select
              value={minFollowers}
              onChange={e => setMinFollowers(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Any</option>
              <option value="10000">10K+</option>
              <option value="50000">50K+</option>
              <option value="100000">100K+</option>
              <option value="500000">500K+</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading creators...</div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No creators found matching your filters.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map(creator => (
              <Link key={creator.id} href={`/creators/${creator.id}`} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow block">
                <div className="flex items-start gap-4">
                  <img
                    src={creator.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.name}`}
                    alt={creator.name}
                    className="w-14 h-14 rounded-full bg-indigo-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{creator.name}</h3>
                    <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full capitalize">{creator.niche}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-3 line-clamp-2">{creator.bio}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-indigo-600">{formatFollowers(creator.followers)}</span>
                  <span className="text-sm text-gray-500">followers</span>
                </div>
                <div className="mt-2 flex gap-2 text-xs text-gray-500">
                  {creator.instagram && <span>📸 IG</span>}
                  {creator.youtube && <span>▶️ YT</span>}
                  {creator.tiktok && <span>🎵 TT</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
