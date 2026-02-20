import React, { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { login } from "../../api/auth.api"; // adjust the path to your API helper

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData);
      const response = await login(formData);

      if (response?.user && response?.token) {
        localStorage.setItem("access_token", response.token);
        toast.success("Login Success");
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <div className="mt-10 max-w-md mx-auto p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-white text-center mb-6">
        Login to CreatorBridge
      </h2>
      <form className="flex flex-col gap-4" onSubmit={onFormSubmit}>
        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-[16px] font-semibold text-white" htmlFor="email">
            Email
          </label>
          <input
            className="border border-gray-400 px-3 py-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white/10 text-white placeholder-gray-300"
            id="email"
            name="email"
            type="email"
            placeholder="johndoe@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-[16px] font-semibold text-white" htmlFor="password">
            Password
          </label>
          <input
            className="border border-gray-400 px-3 py-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white/10 text-white placeholder-gray-300"
            id="password"
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="mt-4 w-full py-3.5 font-bold text-white rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 transition-all shadow-lg"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;