import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import API_URL from '../api'
import toast from 'react-hot-toast'

import {
  FaCar, FaCheckCircle, FaTimesCircle,
  FaClock, FaArrowRight, FaParking
} from 'react-icons/fa'

const MyBookings = () => {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/bookings/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setBookings(res.data.bookings)
    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle className="text-green-500" />
      case 'cancelled': return <FaTimesCircle className="text-red-500" />
      case 'completed': return <FaCheckCircle className="text-blue-500" />
      default: return <FaClock className="text-yellow-500" />
    }
  }

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16
                          border-b-4 border-blue-700"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              My Bookings
            </h1>
            <p className="text-gray-500 text-sm">
              Total: {bookings.length} bookings
            </p>
          </div>
          <Link
            to="/booking"
            className="bg-blue-700 hover:bg-blue-800 text-white
                       px-4 py-2.5 rounded-xl font-bold transition
                       flex items-center gap-2 text-sm"
          >
            + New Booking
          </Link>
        </div>

        {/* Filter Tabs - Scrollable on mobile */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-xl font-medium 
                          capitalize transition text-sm whitespace-nowrap
                ${filter === status
                  ? 'bg-blue-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
                }`}
            >
              {status} ({status === 'all'
                ? bookings.length
                : bookings.filter(b => b.status === status).length
              })
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <FaParking className="text-gray-300 text-5xl mx-auto mb-3" />
            <p className="text-gray-500 mb-4">
              No {filter === 'all' ? '' : filter} bookings found
            </p>
            <Link
              to="/booking"
              className="bg-blue-700 text-white px-5 py-2.5
                         rounded-xl font-bold hover:bg-blue-800 transition"
            >
              Book Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow p-4
                           hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">

                  {/* Left Info */}
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2.5 rounded-xl">
                      <FaCar className="text-blue-700 text-xl" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {getStatusIcon(booking.status)}
                        <h3 className="text-base font-bold text-gray-800">
                          Slot {booking.slot_number}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full
                                         text-xs font-medium
                                         ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">
                        🚗 {booking.vehicle_number} •
                        <span className="capitalize"> {booking.slot_type}</span>
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        📅 {new Date(booking.start_time).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400 text-xs">
                        ⏱️ {booking.total_hours} hours
                      </p>
                    </div>
                  </div>

                  {/* Right Info */}
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-green-700">
                      ₹{booking.total_amount}
                    </p>
                    <Link
                      to={`/booking/${booking.id}`}
                      className="bg-blue-700 hover:bg-blue-800
                                 text-white px-3 py-1.5 rounded-xl
                                 text-xs font-medium transition
                                 flex items-center gap-1
                                 justify-end mt-2"
                    >
                      Details <FaArrowRight className="text-xs" />
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default MyBookings
