'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Campaign {
  id: string;
  brandId: string;
  creatorId: string;
  title: string;
  description: string;
  budget: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  type: 'creator' | 'brand';
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const [fetchError, setFetchError] = useState('');

  const fetchCampaigns = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/campaigns', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCampaigns(await res.json());
      else setFetchError('Failed to load campaigns.');
    } catch {
      setFetchError('Network error. Please try again.');
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('tf_user');
    const token = localStorage.getItem('tf_token');
    if (!storedUser || !token) { router.push('/login'); return; }
    const u = JSON.parse(storedUser) as User;
    setUser(u);
    fetchCampaigns(token).finally(() => setLoading(false));
  }, [router, fetchCampaigns]);

  const handleCampaignAction = async (campaignId: string, status: 'accepted' | 'declined') => {
    const token = localStorage.getItem('tf_token');
    const res = await fetch(`/api/campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status } : c));
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}!</p>
          </div>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
            {user.type}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link href="/marketplace" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold text-gray-900">Browse Creators</h3>
            <p className="text-sm text-gray-500 mt-1">Discover and connect with creators</p>
          </Link>
          {user.type === 'creator' && (
            <Link href={`/creators/${user.id}`} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="text-3xl mb-2">👤</div>
              <h3 className="font-semibold text-gray-900">My Profile</h3>
              <p className="text-sm text-gray-500 mt-1">View your public creator profile</p>
            </Link>
          )}
        </div>

        {/* Campaigns */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {user.type === 'creator' ? 'Incoming Campaign Requests' : 'My Campaign Requests'}
          </h2>

          {fetchError && <p className="text-red-500 text-sm mb-4">{fetchError}</p>}
          {campaigns.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-4xl mb-2">📭</p>
              <p>No campaigns yet.</p>
              {user.type === 'brand' && (
                <p className="mt-2 text-sm">
                  <Link href="/marketplace" className="text-indigo-600 hover:underline">Browse creators</Link> to send your first campaign!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map(c => (
                <div key={c.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{c.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-indigo-600 font-semibold">${c.budget.toLocaleString()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status]}`}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    {user.type === 'creator' && c.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCampaignAction(c.id, 'accepted')}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleCampaignAction(c.id, 'declined')}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
