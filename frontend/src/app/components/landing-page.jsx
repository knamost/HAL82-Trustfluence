import { Link } from "react-router";
import { Search, Star, Users, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "../context/auth-context";

/* ── Lightweight public navbar (shown when there's no sidebar) ── */
function PublicNav() {
  const { isAuthenticated } = useAuth();
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">TF</span>
          </div>
          <span className="text-lg font-semibold text-foreground">Trustfluence</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/creators" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Discover
          </Link>
          <Link to="/requirements" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Campaigns
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard" className="text-sm bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors font-medium">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth" className="text-sm text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors font-medium">
                Log in
              </Link>
              <Link to="/auth" className="text-sm bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors font-medium">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  return (
    <div>
      <PublicNav />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F0F4FF] to-[#EEF2FF]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2563EB]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#2563EB]/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="text-center max-w-4xl mx-auto">

            <h1 className="text-[#0A1628] mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1 }}>
              Where Brands Meet{" "}
              <span className="text-[#2563EB]">Trusted Creators</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-10" style={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
              Discover verified creators with real engagement metrics, connect with brands you can trust, and build partnerships based on transparency and mutual ratings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
  {isAuthenticated ? (
    <>
      <Link
        to="/dashboard"
        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-all shadow-lg shadow-[#2563EB]/25"
        style={{ fontWeight: 500 }}
      >
        Go to Dashboard
        <ArrowRight className="w-4 h-4" />
      </Link>
    </>
  ) : (
    <>
      <Link
        to="/auth?role=creator"
        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-all shadow-lg shadow-[#2563EB]/25"
        style={{ fontWeight: 500 }}
      >
        Join as Creator
        <ArrowRight className="w-4 h-4" />
      </Link>

      <Link
        to="/auth?role=brand"
        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-[#0A1628] rounded-xl hover:bg-gray-50 transition-all border border-border shadow-sm"
        style={{ fontWeight: 500 }}
      >
        Join as Brand
        <ArrowRight className="w-4 h-4" />
      </Link>
    </>
  )}
</div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Active Creators", value: "10K+" },
              { label: "Brand Partners", value: "2.5K+" },
              { label: "Campaigns", value: "45K+" },
              { label: "Trust Score Avg", value: "4.7/5" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4">
                <div className="text-[#2563EB]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-[#0A1628] mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700 }}>
              Built on Trust & Transparency
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.05rem' }}>
              Every feature is designed to foster authentic partnerships between creators and brands.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Verified Engagement Metrics",
                description: "Real-time analytics and verified follower counts. No inflated numbers, no fake engagement \u2014 just authentic performance data you can trust.",
                color: "#2563EB",
                bg: "#EEF2FF",
              },
              {
                icon: Search,
                title: "Smart Creator & Brand Discovery",
                description: "Advanced filters for niche, engagement rate, follower count, and platform. Find the perfect match for your campaign or brand partnership.",
                color: "#059669",
                bg: "#ECFDF5",
              },
              {
                icon: Star,
                title: "Mutual Rating & Trust System",
                description: "Both creators and brands rate each other after every collaboration. Build your reputation through genuine reviews and trust scores.",
                color: "#D97706",
                bg: "#FFFBEB",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-8 rounded-2xl border border-border bg-white hover:shadow-lg transition-all duration-300 group"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: feature.bg }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-[#0A1628] mb-3" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{feature.title}</h3>
                <p className="text-muted-foreground" style={{ lineHeight: 1.7 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-[#0A1628] mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700 }}>
              How Trustfluence Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.05rem' }}>
              A transparent marketplace where everyone benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* For Brands */}
            <div className="bg-white rounded-2xl p-8 border border-border shadow-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EEF2FF] text-[#2563EB] rounded-full mb-6" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                <Users className="w-4 h-4" />
                For Brands
              </div>
              <div className="space-y-5">
                {[
                  "Post detailed campaign requirements with budget and niche",
                  "Browse verified creators with real engagement metrics",
                  "Review creator portfolios, ratings, and past collaborations",
                  "Rate and review creators after each partnership",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#2563EB] mt-0.5 shrink-0" />
                    <span className="text-[#0A1628]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* For Creators */}
            <div className="bg-white rounded-2xl p-8 border border-border shadow-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ECFDF5] text-[#059669] rounded-full mb-6" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                <Star className="w-4 h-4" />
                For Creators
              </div>
              <div className="space-y-5">
                {[
                  "Showcase your niches, promotion types, and engagement stats",
                  "Browse open campaign opportunities from verified brands",
                  "Check brand trust scores and creator reviews before applying",
                  "Build your reputation through transparent rating system",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#059669] mt-0.5 shrink-0" />
                    <span className="text-[#0A1628]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Creators Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-[#0A1628] mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700 }}>
              Top Trusted Creators
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.05rem' }}>
              Discover verified creators with proven engagement and excellent trust ratings.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Chen",
                niche: "Lifestyle",
                followers: "125K",
                engagement: "4.8%",
                rating: 4.7,
                img: "https://images.unsplash.com/photo-1758526213838-19d832f4aaa5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwbGlmZXN0eWxlJTIwY3JlYXRvciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTU5Mzk3M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
              },
              {
                name: "Marcus Rivera",
                niche: "Technology",
                followers: "340K",
                engagement: "5.2%",
                rating: 4.9,
                img: "https://images.unsplash.com/photo-1719257751404-1dea075324bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBjcmVhdGl2ZSUyMGhlYWRzaG90fGVufDF8fHx8MTc3MTU5Mzk3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
              },
              {
                name: "Emma Larsson",
                niche: "Fitness",
                followers: "89K",
                engagement: "6.1%",
                rating: 4.5,
                img: "https://images.unsplash.com/photo-1769636930016-5d9f0ca653aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGNyZWF0aXZlJTIwcHJvZmVzc2lvbmFsJTIwd29tYW4lMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzE1OTM5NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
              },
            ].map((creator) => (
              <Link
                key={creator.name}
                to="/creators/1"
                className="group p-6 rounded-2xl border border-border bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <ImageWithFallback
                    src={creator.img}
                    alt={creator.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-[#0A1628] group-hover:text-[#2563EB] transition-colors" style={{ fontWeight: 600 }}>{creator.name}</h4>
                    <span className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>{creator.niche}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Followers</div>
                    <div className="text-[#0A1628]" style={{ fontWeight: 600 }}>{creator.followers}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Engagement</div>
                    <div className="text-[#2563EB]" style={{ fontWeight: 600 }}>{creator.engagement}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Rating</div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span style={{ fontWeight: 600 }}>{creator.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/creators"
              className="inline-flex items-center gap-2 px-6 py-3 text-[#2563EB] border border-[#2563EB] rounded-xl hover:bg-[#EEF2FF] transition-colors"
              style={{ fontWeight: 500 }}
            >
              Explore All Creators
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0A1628] to-[#1E3A5F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-white mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700 }}>
            Ready to Build Trusted Partnerships?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8" style={{ fontSize: '1.05rem' }}>
            Join thousands of creators and brands already building authentic partnerships on Trustfluence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#3B82F6] transition-all"
              style={{ fontWeight: 500 }}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A1628] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TF</span>
                </div>
                <span className="text-lg font-semibold">Trustfluence</span>
              </div>
              <p className="text-gray-400 text-sm">
                Building trust between brands and creators through transparency and verified metrics.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-gray-300 font-medium">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/creators" className="hover:text-white transition-colors">Discover Creators</Link></li>
                <li><Link to="/requirements" className="hover:text-white transition-colors">Campaigns</Link></li>
                {!isAuthenticated && <li><Link to="/auth" className="hover:text-white transition-colors">Sign Up</Link></li>}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-gray-300 font-medium">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-gray-300 font-medium">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Trustfluence. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
