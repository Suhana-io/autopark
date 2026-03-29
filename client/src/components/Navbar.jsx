import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaCar, FaBars, FaTimes } from 'react-icons/fa'
import toast from 'react-hot-toast'

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 
                      flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold"
        >
          <FaCar className="text-yellow-400 text-2xl" />
          <span>AutoPark</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-yellow-400 transition">
            Home
          </Link>

          {user ? (
            <>
              {isAdmin() ? (
                <Link
                  to="/admin"
                  className="hover:text-yellow-400 transition"
                >
                  Admin Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="hover:text-yellow-400 transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/booking"
                    className="hover:text-yellow-400 transition"
                  >
                    Book Slot
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="hover:text-yellow-400 transition"
                  >
                    My Bookings
                  </Link>
                </>
              )}
              <div className="flex items-center gap-3">
                <span className="text-yellow-300 font-medium">
                  👋 {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 
                             px-4 py-1.5 rounded-lg transition font-medium"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-yellow-400 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-yellow-400 text-blue-900 
                           hover:bg-yellow-300 px-4 py-1.5 
                           rounded-lg transition font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-800 px-4 py-4 
                        flex flex-col gap-3 border-t border-blue-600">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="py-2 border-b border-blue-700 
                       hover:text-yellow-400 transition"
          >
            🏠 Home
          </Link>

          {user ? (
            <>
              {isAdmin() ? (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 border-b border-blue-700
                             hover:text-yellow-400 transition"
                >
                  🛡️ Admin Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="py-2 border-b border-blue-700
                               hover:text-yellow-400 transition"
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    to="/booking"
                    onClick={() => setMenuOpen(false)}
                    className="py-2 border-b border-blue-700
                               hover:text-yellow-400 transition"
                  >
                    🅿️ Book Slot
                  </Link>
                  <Link
                    to="/my-bookings"
                    onClick={() => setMenuOpen(false)}
                    className="py-2 border-b border-blue-700
                               hover:text-yellow-400 transition"
                  >
                    📋 My Bookings
                  </Link>
                </>
              )}
              <div className="py-2 border-b border-blue-700">
                <p className="text-yellow-300 font-medium mb-2">
                  👋 {user.name}
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 hover:bg-red-600
                             px-4 py-2 rounded-lg transition 
                             font-medium text-left"
                >
                  🚪 Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="py-2 border-b border-blue-700
                           hover:text-yellow-400 transition"
              >
                🔑 Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-yellow-400 text-blue-900
                           px-4 py-2 rounded-lg font-medium
                           text-center hover:bg-yellow-300 transition"
              >
                ✨ Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar