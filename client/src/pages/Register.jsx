import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaCar, FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'
import axios from 'axios'
import API_URL from '../api'

const Register = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters!')
      return
    }

    // Validate phone number
    if (formData.phone.length < 10) {
      toast.error('Please enter a valid phone number!')
      return
    }

    setLoading(true)

    try {
      await axios.post(
  `${API_URL}/api/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        }
      )

      toast.success('Registration successful! Please login 🎉')
      navigate('/login')

    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-700 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <FaCar className="text-blue-700 text-5xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">AutoPark</h1>
          <p className="text-gray-500 mt-1">Create your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent transition"
            />
          </div>

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

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
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
                placeholder="Min 6 characters"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white 
                       font-bold py-3 rounded-xl transition text-lg mt-2
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>

        </form>

        {/* Login Link */}
        <p className="text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-700 font-bold hover:underline"
          >
            Login here
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register