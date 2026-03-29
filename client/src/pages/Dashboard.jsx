import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import API_URL from '../api'
import toast from 'react-hot-toast'

import {
  FaCar, FaParking, FaCheckCircle,
  FaTimesCircle, FaClock, FaArrowRight
} from 'react-icons/fa'

const Dashboard = () => {
  const { user, token } = useAuth()
  const [slots, setSlots] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const slotsRes = await axios.get(
       `${API_URL}/api/slots/available`
 
      )
      setSlots(slotsRes.data.slots)

      const bookingsRes = await axios.get(
      `${API_URL}/api/bookings/my`,
       { headers: { Authorization: `Bearer ${token}` } }
      )
      setMyBookings(bookingsRes.data.bookings)
    } catch (err) {
      toast.error('Failed to load data')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16
                            border-b-4 border-blue-700 mx-auto mb-4">
            </div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Welcome Banner */}
        <div className="bg-blue-700 text-white rounded-2xl p-5 mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-1">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-blue-200 text-sm">
            Manage your parking bookings easily
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">

          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <FaParking className="text-blue-600 text-3xl mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">
              {slots.length}
            </p>
            <p className="text-gray-500 text-xs">Available Slots</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <FaCar className="text-green-500 text-3xl mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">
              {myBookings.length}
            </p>
            <p className="text-gray-500 text-xs">Total Bookings</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <FaCheckCircle className="text-purple-500 text-3xl mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">
              {myBookings.filter(b => b.status === 'confirmed').length}
            </p>
            <p className="text-gray-500 text-xs">Active</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <FaTimesCircle className="text-red-500 text-3xl mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">
              {myBookings.filter(b => b.status === 'cancelled').length}
            </p>
            <p className="text-gray-500 text-xs">Cancelled</p>
          </div>

        </div>

        {/* Quick Book Button */}
        <div className="bg-yellow-50 border-2 border-yellow-400
                        rounded-2xl p-4 mb-6 flex items-center
                        justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Need to Park?
            </h2>
            <p className="text-gray-500 text-sm">
              Book your slot now in just a few clicks!
            </p>
          </div>
          <Link
            to="/booking"
            className="bg-blue-700 hover:bg-blue-800 text-white
                       px-5 py-2.5 rounded-xl font-bold
                       flex items-center gap-2 transition
                       text-sm w-full sm:w-auto justify-center"
          >
            Book a Slot <FaArrowRight />
          </Link>
        </div>

        {/* Available Slots */}
        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Available Slots
            </h2>
            <Link
              to="/booking"
              className="text-blue-700 hover:underline
                         font-medium flex items-center gap-1 text-sm"
            >
              View All <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {slots.length === 0 ? (
            <div className="text-center py-6">
              <FaParking className="text-gray-300 text-4xl mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                No slots available right now
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 
                            md:grid-cols-4 gap-3">
              {slots.slice(0, 8).map((slot) => (
                <div
                  key={slot.id}
                  className="border-2 border-green-200 bg-green-50
                             rounded-xl p-3 text-center"
                >
                  <p className="text-xl font-bold text-green-700">
                    {slot.slot_number}
                  </p>
                  <p className="text-gray-500 text-xs capitalize">
                    {slot.slot_type}
                  </p>
                  <p className="text-gray-400 text-xs">{slot.floor}</p>
                  <p className="text-green-700 font-bold text-sm mt-1">
                    ₹{slot.price_per_hour}/hr
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Recent Bookings
            </h2>
            <Link
              to="/my-bookings"
              className="text-blue-700 hover:underline
                         font-medium flex items-center gap-1 text-sm"
            >
              View All <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {myBookings.length === 0 ? (
            <div className="text-center py-6">
              <FaCar className="text-gray-300 text-4xl mx-auto mb-2" />
              <p className="text-gray-500 text-sm mb-3">No bookings yet</p>
              <Link
                to="/booking"
                className="bg-blue-700 text-white px-5 py-2
                           rounded-xl font-medium hover:bg-blue-800
                           transition text-sm"
              >
                Book Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between
                             border border-gray-100 rounded-xl p-3
                             hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(booking.status)}
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        Slot {booking.slot_number}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {booking.vehicle_number}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full
                                     text-xs font-medium
                                     ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <p className="text-gray-700 font-bold text-sm mt-0.5">
                      ₹{booking.total_amount}
                    </p>
                    <Link
                      to={`/booking/${booking.id}`}
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard