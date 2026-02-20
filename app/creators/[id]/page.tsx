import { notFound } from 'next/navigation';
import store from '@/lib/store';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CreatorProfilePage({ params }: Props) {
  const { id } = await params;
  const creator = store.creators.find(c => c.id === id);
  if (!creator) notFound();

  const { passwordHash: _pw, ...safeCreator } = creator;

  const formatFollowers = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n.toString();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/marketplace" className="text-indigo-600 hover:underline text-sm mb-6 inline-block">← Back to Marketplace</Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-start gap-6">
            <img
              src={safeCreator.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${safeCreator.name}`}
              alt={safeCreator.name}
              className="w-24 h-24 rounded-full bg-indigo-100"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{safeCreator.name}</h1>
              <span className="inline-block bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full capitalize mt-1">
                {safeCreator.niche}
              </span>
              <div className="mt-2 text-2xl font-bold text-indigo-600">
                {formatFollowers(safeCreator.followers)} <span className="text-sm font-normal text-gray-500">followers</span>
              </div>
            </div>
          </div>

          <p className="text-gray-700 mt-6 leading-relaxed">{safeCreator.bio}</p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {safeCreator.instagram && (
              <div className="bg-pink-50 rounded-xl p-4 text-center">
                <div className="text-2xl">📸</div>
                <div className="text-xs text-gray-500 mt-1">Instagram</div>
                <div className="text-sm font-medium text-gray-800">@{safeCreator.instagram}</div>
              </div>
            )}
            {safeCreator.youtube && (
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <div className="text-2xl">▶️</div>
                <div className="text-xs text-gray-500 mt-1">YouTube</div>
                <div className="text-sm font-medium text-gray-800">@{safeCreator.youtube}</div>
              </div>
            )}
            {safeCreator.tiktok && (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl">🎵</div>
                <div className="text-xs text-gray-500 mt-1">TikTok</div>
                <div className="text-sm font-medium text-gray-800">@{safeCreator.tiktok}</div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              href="/register?type=brand"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors inline-block"
            >
              Work with {safeCreator.name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
