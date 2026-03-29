import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaCar, FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'
import axios from 'axios'
import API_URL from '../api'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await axios.post(
  `${API_URL}/api/auth/login`,
  formData
)

      login(res.data.user, res.data.token)
      toast.success('Login successful! Welcome back 👋')

      // Redirect based on role
      if (res.data.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-700 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <FaCar className="text-blue-700 text-5xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">AutoPark</h1>
          <p className="text-gray-500 mt-1">Login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white 
                       font-bold py-3 rounded-xl transition text-lg
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        

        {/* Register Link */}
        <p className="text-center text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-blue-700 font-bold hover:underline"
          >
            Register here
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login