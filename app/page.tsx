import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
          Connect{' '}
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Creators
          </span>{' '}
          with Brands
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Trustfluence is the marketplace where authentic creators meet forward-thinking brands. Build meaningful partnerships that drive real results.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register?type=creator"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-indigo-200"
          >
            Join as Creator
          </Link>
          <Link
            href="/register?type=brand"
            className="bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Join as Brand
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-3 gap-8 text-center">
          {[
            { value: '10K+', label: 'Creators' },
            { value: '500+', label: 'Brands' },
            { value: '$2M+', label: 'Paid Out' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-indigo-600">{stat.value}</div>
              <div className="text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Trustfluence?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🔍',
              title: 'Smart Discovery',
              desc: 'Find creators by niche, follower count, and platform. Data-driven matching for better results.',
            },
            {
              icon: '🤝',
              title: 'Seamless Collaboration',
              desc: 'Send and receive campaign requests directly. Manage all your partnerships in one place.',
            },
            {
              icon: '📊',
              title: 'Track Everything',
              desc: 'Monitor campaign status and manage budgets with a clear, organized dashboard.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to grow together?</h2>
          <p className="text-indigo-100 mb-8 text-lg">Join thousands of creators and brands already collaborating on Trustfluence.</p>
          <Link
            href="/marketplace"
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-xl font-semibold text-lg transition-colors inline-block"
          >
            Explore Creators
          </Link>
        </div>
      </section>
    </div>
  );
}
