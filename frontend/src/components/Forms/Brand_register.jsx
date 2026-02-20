import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Building2,
  Globe,
  MapPin,
  DollarSign,
  Target,
} from "lucide-react";

const INDUSTRIES = [
  "Food & Beverage",
  "Fashion & Apparel",
  "Beauty & Cosmetics",
  "Technology",
  "Travel & Tourism",
  "Health & Fitness",
  "Education",
  "Real Estate",
  "Entertainment",
];

const BUDGET_RANGES = [
  "NPR 10,000 - 25,000",
  "NPR 25,000 - 50,000",
  "NPR 50,000 - 100,000",
  "NPR 100,000+",
];

export default function BrandOnboarding() {
  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRIES[0]);
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_RANGES[1]);

  const progressValue = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Create Your Brand Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Let's get you started with finding the perfect creators
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between mb-4">
            <span className="text-sm font-semibold text-gray-900">
              Step {step} of 3
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {Math.round(progressValue)}% Complete
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressValue}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm">
            <span className={step === 1 ? "text-blue-600 font-semibold" : "text-gray-500"}>
              Company Info
            </span>
            <span className={step === 2 ? "text-blue-600 font-semibold" : "text-gray-500"}>
              Campaign Goals
            </span>
            <span className={step === 3 ? "text-blue-600 font-semibold" : "text-gray-500"}>
              Preview
            </span>
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-100 transition-all">
            <h2 className="text-3xl font-bold mb-8">Company Information</h2>

            <div className="space-y-6">
              {/* Logo */}
              <div>
                <label className="font-semibold">Brand Logo</label>
                <div className="mt-3 flex items-center gap-6">
                  <div className="w-32 h-32 rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Upload className="w-10 h-10 text-gray-400" />
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg">
                    Upload Logo
                  </button>
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="font-semibold">Company Name</label>
                <input
                  placeholder="Enter company name"
                  className="mt-2 w-full h-12 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="font-semibold">Industry</label>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => setSelectedIndustry(industry)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        selectedIndustry === industry
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
                <input
                  placeholder="https://yourcompany.com"
                  className="mt-2 w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <input
                  placeholder="Kathmandu, Nepal"
                  className="mt-2 w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* About */}
              <div>
                <label className="font-semibold">About Brand</label>
                <textarea
                  rows={4}
                  placeholder="Tell creators about your brand..."
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end mt-10">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center gap-2 font-semibold"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold mb-8">Campaign Preferences</h2>

            {/* Budget */}
            <div>
              <label className="font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Campaign Budget
              </label>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {BUDGET_RANGES.map((budget) => (
                  <button
                    key={budget}
                    onClick={() => setSelectedBudget(budget)}
                    className={`px-5 py-4 rounded-xl font-medium ${
                      selectedBudget === budget
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-10">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border rounded-xl flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>

              <button
                onClick={() => setStep(3)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center gap-2 font-semibold"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold mb-8">Preview</h2>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border">
              <h3 className="text-2xl font-bold mb-2">Your Brand Profile</h3>
              <p className="text-gray-700 mb-4">
                Industry: {selectedIndustry}
              </p>
              <p className="text-gray-700">
                Budget Range: {selectedBudget}
              </p>
            </div>

            <div className="flex justify-between mt-10">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border rounded-xl flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>

              <button className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition">
                Launch My Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}