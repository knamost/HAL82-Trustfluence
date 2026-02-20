import React from 'react'
import Navbar from '../components/header/navbar'
import LoginForm from '../components/Forms/login_form'
import { Link } from 'react-router'

const Login_page = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Centered Login Container */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl py-8 px-6">
          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Login
          </h1>
          <p className="text-center text-white/80 mb-6">
            Access your CreatorBridge account
          </p>

          {/* Login Form */}
          <LoginForm />

          {/* Link to Register */}
          <p className="text-center mt-6 text-white/80">
            Don't have an account?{' '}
            <Link to={'/register'}>
              <span className="text-blue-400 hover:text-blue-600 italic font-semibold transition-colors">
                Create Account
              </span>
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default Login_page