import React, { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { register } from "../../api/auth.api"; // adjust path to your API

const RegisterForm = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    password: "",
    c_password: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role) {
      toast.error("Please select a user type");
      return;
    }

    if (formData.password !== formData.c_password) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Call your API
      const response = await register(formData);

      toast.success(response.message || "Account Created Successfully 🎉");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 max-w-md mx-auto p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg">

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* First Name */}
        <div className="flex flex-col gap-1">
          <label className="text-white font-semibold">First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="John"
            required
            className="border border-gray-400 px-3 py-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white/10 text-white placeholder-gray-300"
          />
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1">
          <label className="text-white font-semibold">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Doe"
            required
            className="border border-gray-400 px-3 py-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white/10 text-white placeholder-gray-300"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-white font-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="johndoe@example.com"
            required
            className="border border-gray-400 px-3 py-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white/10 text-white placeholder-gray-300"
          />
        </div>

        {/* Role Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-white font-semibold">User Type</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="border border-gray-400 px-3 py-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white/10 text-white placeholder-gray-300"
          >
            <option value="">Select user type</option>
            <option value="creator">Creator</option>
            <option value="brand">Brand</option>
          </select>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-white font-semibold">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              className="w-full border border-gray-400 px-3 py-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white/10 text-white placeholder-gray-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-white text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <label className="text-white font-semibold">Re-type Password</label>
          <div className="relative">
            <input
              type={showCPassword ? "text" : "password"}
              name="c_password"
              value={formData.c_password}
              onChange={handleChange}
              placeholder="Re-type password"
              required
              className="w-full border border-gray-400 px-3 py-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white/10 text-white placeholder-gray-300"
            />
            <button
              type="button"
              onClick={() => setShowCPassword(!showCPassword)}
              className="absolute right-3 top-2.5 text-white text-sm"
            >
              {showCPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full py-3.5 font-bold text-white rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 transition-all shadow-lg disabled:opacity-60"
        >
          {loading ? "Creating..." : "Next"}
        </button>

      </form>
    </div>
  );
};

export default RegisterForm;