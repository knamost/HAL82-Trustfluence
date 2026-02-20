import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Shield, Users, BarChart3, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "../context/auth-context";
import { login as loginApi, register as registerApi } from "../../lib/auth.service";
import { ApiError } from "../../lib/api-client";

export function AuthPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (activeTab === "register") {
      if (!role) newErrors.role = "Please select a role";
      if (!firstName.trim()) newErrors.firstName = "First name is required";
      if (!lastName.trim()) newErrors.lastName = "Last name is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setApiLoading(true);
    try {
      let user;
      if (activeTab === "login") {
        user = await loginApi({ email, password });
      } else {
        user = await registerApi({
          email,
          password,
          role: role as "creator" | "brand",
          first_name: firstName,
          last_name: lastName,
        });
      }
      setUser(user);
      setSubmitted(true);
      setTimeout(() => {
        navigate(user.role === "creator" ? "/dashboard" : "/dashboard");
      }, 600);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ api: err.message });
      } else {
        setErrors({ api: "Something went wrong. Please try again." });
      }
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A1628] to-[#1E3A5F] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#2563EB]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#2563EB]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-white" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Trustfluence</span>
          </div>

          <ImageWithFallback
            src="https://images.unsplash.com/photo-1758599543152-a73184816eba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsYWJvcmF0aW9uJTIwbWVldGluZyUyMGJ1c2luZXNzJTIwcGFydG5lcnNoaXB8ZW58MXx8fHwxNzcxNTkzOTc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Creators and brands collaborating"
            className="w-full rounded-2xl mb-8 shadow-2xl"
          />

          <h2 className="text-white mb-4" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
            Build Partnerships Based on Trust
          </h2>
          <p className="text-gray-300 mb-8" style={{ lineHeight: 1.7 }}>
            Join a transparent marketplace where verified metrics and mutual ratings drive meaningful collaborations.
          </p>

          <div className="space-y-4">
            {[
              { icon: Users, text: "Connect with verified brands and creators" },
              { icon: BarChart3, text: "Access real engagement analytics" },
              { icon: Star, text: "Build trust through mutual ratings" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 bg-[#2563EB]/20 rounded-lg flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-[#60A5FA]" />
                </div>
                <span style={{ fontSize: '0.875rem' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#0A1628]" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Trustfluence</span>
            </div>
            <h1 className="text-[#0A1628] mb-2" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {activeTab === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted-foreground">
              {activeTab === "login"
                ? "Sign in to continue to your dashboard"
                : "Start building trusted partnerships today"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#F1F5F9] rounded-xl p-1 mb-8">
            <button
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                activeTab === "login"
                  ? "bg-white text-[#0A1628] shadow-sm"
                  : "text-muted-foreground hover:text-[#0A1628]"
              }`}
              style={{ fontWeight: 500 }}
              onClick={() => { setActiveTab("login"); setErrors({}); }}
            >
              Log in
            </button>
            <button
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                activeTab === "register"
                  ? "bg-white text-[#0A1628] shadow-sm"
                  : "text-muted-foreground hover:text-[#0A1628]"
              }`}
              style={{ fontWeight: 500 }}
              onClick={() => { setActiveTab("register"); setErrors({}); }}
            >
              Register
            </button>
          </div>

          {submitted && (
            <div className="mb-6 p-4 bg-[#ECFDF5] text-[#059669] rounded-xl" style={{ fontSize: '0.875rem' }}>
              {activeTab === "login" ? "Login successful! Redirecting..." : "Account created successfully! Redirecting..."}
            </div>
          )}

          {errors.api && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl" style={{ fontSize: '0.875rem' }}>
              {errors.api}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name fields (Register only) */}
            {activeTab === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    First name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className={`w-full px-4 py-3 rounded-xl border bg-[#F8FAFC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${
                      errors.firstName ? "border-red-400 bg-red-50" : "border-border"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-red-500" style={{ fontSize: '0.8125rem' }}>{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    Last name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className={`w-full px-4 py-3 rounded-xl border bg-[#F8FAFC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${
                      errors.lastName ? "border-red-400 bg-red-50" : "border-border"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-red-500" style={{ fontSize: '0.8125rem' }}>{errors.lastName}</p>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-xl border bg-[#F8FAFC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${
                  errors.email ? "border-red-400 bg-red-50" : "border-border"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-red-500" style={{ fontSize: '0.8125rem' }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border bg-[#F8FAFC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${
                    errors.password ? "border-red-400 bg-red-50" : "border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0A1628] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-red-500" style={{ fontSize: '0.8125rem' }}>{errors.password}</p>
              )}
            </div>

            {/* Role Selector (Register only) */}
            {activeTab === "register" && (
              <div>
                <label className="block mb-1.5 text-[#0A1628]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("creator")}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      role === "creator"
                        ? "border-[#2563EB] bg-[#EEF2FF] text-[#2563EB]"
                        : "border-border bg-white text-muted-foreground hover:border-[#2563EB]/30"
                    }`}
                  >
                    <Users className="w-6 h-6 mx-auto mb-2" />
                    <span style={{ fontWeight: 500 }}>Creator</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("brand")}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      role === "brand"
                        ? "border-[#2563EB] bg-[#EEF2FF] text-[#2563EB]"
                        : "border-border bg-white text-muted-foreground hover:border-[#2563EB]/30"
                    }`}
                  >
                    <Shield className="w-6 h-6 mx-auto mb-2" />
                    <span style={{ fontWeight: 500 }}>Brand</span>
                  </button>
                </div>
                {errors.role && (
                  <p className="mt-1.5 text-red-500" style={{ fontSize: '0.8125rem' }}>{errors.role}</p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={apiLoading}
              className="w-full py-3.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontWeight: 500 }}
            >
              {apiLoading
                ? "Please wait..."
                : activeTab === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>

            {activeTab === "login" && (
              <div className="text-center">
                <a href="#" className="text-[#2563EB] hover:underline" style={{ fontSize: '0.875rem' }}>
                  Forgot your password?
                </a>
              </div>
            )}
          </form>

          <div className="mt-8 text-center text-muted-foreground" style={{ fontSize: '0.875rem' }}>
            {activeTab === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setActiveTab(activeTab === "login" ? "register" : "login"); setErrors({}); }}
              className="text-[#2563EB] hover:underline"
              style={{ fontWeight: 500 }}
            >
              {activeTab === "login" ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
