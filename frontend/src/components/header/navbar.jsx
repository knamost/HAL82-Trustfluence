import React from 'react'
import { Zap } from 'lucide-react'

const Navbar = () => {
  return (
    <nav className="w-full border-b border-white/10 backdrop-blur-lg bg-white/5 fixed z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-blue-200 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            CreatorBridge
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-yellow-400 hover:to-red-400 transition-colors"
          >
            Home
          </a>
          <a
            href="creators"
            className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 hover:from-pink-400 hover:to-purple-400 transition-colors"
          >
            Creators
          </a>
          <a
            href="brands"
            className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 hover:from-purple-400 hover:to-pink-400 transition-colors"
          >
            Brands
          </a>
          <a
            href="products"
            className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 hover:from-green-400 hover:to-blue-400 transition-colors"
          >
            Products
          </a>

          {/* Login Button */}
          <a
            href="/login"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar