import React from "react";
import RegisterForm from "../components/Forms/register_form";
import { Link } from "react-router";
import Navbar from "../components/header/navbar";

const RegisterPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex flex-col">
      
      {/* Navbar */}
      <Navbar />

      {/* Center Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-10">
        
        <div className="w-full max-w-md 
                        bg-white/10 backdrop-blur-xl 
                        border border-white/20 
                        rounded-2xl shadow-2xl 
                        p-8 
                        transition-all duration-500">

          {/* Brand Title */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CreatorBridge
            </h1>
            <p className="text-white/70 text-sm mt-2">
              Start your journey today 🚀
            </p>
          </div>

          {/* Register Form */}
          <RegisterForm />

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-white/20"></div>
            <span className="px-3 text-sm text-white/60">or</span>
            <div className="flex-grow h-px bg-white/20"></div>
          </div>

          {/* Login Link */}
          <p className="text-center text-white/70 text-sm">
            Already have an account?{" "}
            <Link to="/login">
              <span className="text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer">
                Login →
              </span>
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
};

export default RegisterPage;