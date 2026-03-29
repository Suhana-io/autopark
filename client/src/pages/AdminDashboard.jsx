import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import API_URL from '../api'
import {
  FaUsers, FaParking, FaMoneyBillWave,
  FaCheckCircle, FaTimesCircle, FaCar,
  FaPlus, FaTrash, FaEdit
} from 'react-icons/fa'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

const AdminDashboard = () => {
  const { token } = useAuth()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [slots, setSlots] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activity, setActivity] = useState(null)

  // Add Slot Form
  const [showAddSlot, setShowAddSlot] = useState(false)
  const [slotForm, setSlotForm] = useState({
    slot_number: '',
    slot_type: 'car',
    floor: 'Ground',
    price_per_hour: ''
  })

  useEffect(() => {
    fetchDashboard()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'bookings') fetchBookings()
    if (activeTab === 'slots') fetchSlots()
    if (activeTab === 'payments') fetchPayments()
  }, [activeTab])

  const fetchDashboard = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/admin/activity`,
          { headers: { Authorization: `Bearer ${token}` } })
      ])
      setStats(statsRes.data)
      setActivity(activityRes.data)
    } catch (err) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/admin/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUsers(res.data.users)
    } catch (err) {
      toast.error('Failed to load users')
    }
  }

  const fetchBookings = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/admin/bookings`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setBookings(res.data.bookings)
    } catch (err) {
      toast.error('Failed to load bookings')
    }
  }

  const fetchSlots = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/slots`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSlots(res.data.slots)
    } catch (err) {
      toast.error('Failed to load slots')
    }
  }

  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/payments`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setPayments(res.data.payments)
    } catch (err) {
      toast.error('Failed to load payments')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await axios.delete(
        `${API_URL}/api/admin/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('User deleted')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleAddSlot = async (e) => {
    e.preventDefault()
    try {
      await axios.post(
        `${API_URL}/api/slots`,
        slotForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Slot added successfully!')
      setShowAddSlot(false)
      setSlotForm({
        slot_number: '',
        slot_type: 'car',
        floor: 'Ground',
        price_per_hour: ''
      })
      fetchSlots()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add slot')
    }
  }

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this slot?')) return
    try {
      await axios.delete(
        `${API_URL}/api/slots/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Slot deleted')
      fetchSlots()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleSlotStatus = async (id, status) => {
    try {
      await axios.patch(
        `${API_URL}/api/slots/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Slot status updated')
      fetchSlots()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleCompleteBooking = async (id) => {
    if (!window.confirm('Mark this booking as completed?')) return
    try {
      await axios.put(
        `${API_URL}/api/bookings/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Booking marked as completed')
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const handleRefund = async (id) => {
    if (!window.confirm('Refund this payment?')) return
    try {
      await axios.put(
        `${API_URL}/api/payments/${id}/refund`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Payment refunded')
      fetchPayments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'available': return 'bg-green-100 text-green-700'
      case 'booked': return 'bg-red-100 text-red-700'
      case 'maintenance': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
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
            <p className="text-gray-500">Loading Dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="bg-blue-700 text-white rounded-2xl p-5 mb-6">
          <h1 className="text-xl md:text-2xl font-bold">
            Admin Dashboard 🛡️
          </h1>
          <p className="text-blue-200 text-sm">
            Manage your AutoPark system
          </p>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'slots', label: '🅿️ Slots' },
            { id: 'bookings', label: '📋 Bookings' },
            { id: 'users', label: '👥 Users' },
            { id: 'payments', label: '💰 Payments' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-medium transition
                          text-sm whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && stats && (
          <div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">

              <div className="bg-white rounded-2xl shadow p-4 text-center">
                <FaUsers className="text-blue-600 text-3xl mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800">
                  {stats.users.total}
                </p>
                <p className="text-gray-500 text-xs">Total Users</p>
              </div>

              <div className="bg-white rounded-2xl shadow p-4 text-center">
                <FaParking className="text-green-500 text-3xl mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800">
                  {stats.slots.available}
                </p>
                <p className="text-gray-500 text-xs">Available Slots</p>
              </div>

              <div className="bg-white rounded-2xl shadow p-4 text-center">
                <FaCar className="text-purple-500 text-3xl mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800">
                  {stats.bookings.total}
                </p>
                <p className="text-gray-500 text-xs">Total Bookings</p>
              </div>

              <div className="bg-white rounded-2xl shadow p-4 text-center">
                <FaMoneyBillWave className="text-yellow-500 text-3xl mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800">
                  ₹{stats.revenue.total}
                </p>
                <p className="text-gray-500 text-xs">Total Revenue</p>
              </div>

            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">

              <div className="bg-green-50 border border-green-200
                              rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-green-700">
                  {stats.bookings.active}
                </p>
                <p className="text-green-600 text-xs">Active Bookings</p>
              </div>

              <div className="bg-red-50 border border-red-200
                              rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-red-700">
                  {stats.slots.booked}
                </p>
                <p className="text-red-600 text-xs">Booked Slots</p>
              </div>

              <div className="bg-blue-50 border border-blue-200
                              rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {stats.bookings.today}
                </p>
                <p className="text-blue-600 text-xs">Today's Bookings</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200
                              rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-yellow-700">
                  ₹{stats.revenue.today}
                </p>
                <p className="text-yellow-600 text-xs">Today's Revenue</p>
              </div>

            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              {/* Monthly Revenue Chart */}
              <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  📈 Monthly Revenue
                </h2>
                {stats.revenue.monthly.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={stats.revenue.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [`₹${value}`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2563eb"
                        fill="#bfdbfe"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-gray-400">No revenue data yet</p>
                  </div>
                )}
              </div>

              {/* Bookings Pie Chart */}
              <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  🥧 Bookings Overview
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'Active',
                          value: stats.bookings.active || 0,
                          fill: '#22c55e'
                        },
                        {
                          name: 'Completed',
                          value: stats.bookings.completed || 0,
                          fill: '#3b82f6'
                        },
                        {
                          name: 'Cancelled',
                          value: stats.bookings.cancelled || 0,
                          fill: '#ef4444'
                        }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    />
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Slots Overview */}
              <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  🅿️ Slots Overview
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={[
                      {
                        name: 'Available',
                        count: stats.slots.available,
                      },
                      {
                        name: 'Booked',
                        count: stats.slots.booked,
                      },
                      {
                        name: 'Total',
                        count: stats.slots.total,
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#3b82f6" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Summary */}
              <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  💰 Revenue Summary
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={[
                      {
                        name: "Today",
                        amount: stats.revenue.today
                      },
                      {
                        name: 'Total',
                        amount: stats.revenue.total
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => [`₹${value}`, 'Amount']}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#2563eb"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* Recent Activity */}
            {activity && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Recent Bookings */}
                <div className="bg-white rounded-2xl shadow p-5">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Recent Bookings
                  </h2>
                  <div className="space-y-3">
                    {activity.recentBookings.map((b) => (
                      <div key={b.id}
                        className="flex justify-between items-center
                                   py-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {b.user_name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Slot {b.slot_number}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs
                                         font-medium
                                         ${getStatusColor(b.status)}`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Payments */}
                <div className="bg-white rounded-2xl shadow p-5">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Recent Payments
                  </h2>
                  <div className="space-y-3">
                    {activity.recentPayments.map((p) => (
                      <div key={p.id}
                        className="flex justify-between items-center
                                   py-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {p.user_name}
                          </p>
                          <p className="text-gray-400 text-xs capitalize">
                            {p.payment_method}
                          </p>
                        </div>
                        <p className="font-bold text-green-700">
                          ₹{p.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ── SLOTS TAB ── */}
        {activeTab === 'slots' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Parking Slots
              </h2>
              <button
                onClick={() => setShowAddSlot(!showAddSlot)}
                className="bg-blue-700 hover:bg-blue-800 text-white
                           px-4 py-2 rounded-xl font-medium
                           flex items-center gap-2 transition text-sm"
              >
                <FaPlus /> Add Slot
              </button>
            </div>

            {/* Add Slot Form */}
            {showAddSlot && (
              <div className="bg-white rounded-2xl shadow p-5 mb-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Add New Slot
                </h3>
                <form
                  onSubmit={handleAddSlot}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                  <div>
                    <label className="block text-gray-600 text-xs mb-1">
                      Slot Number
                    </label>
                    <input
                      type="text"
                      value={slotForm.slot_number}
                      onChange={(e) => setSlotForm({
                        ...slotForm,
                        slot_number: e.target.value.toUpperCase()
                      })}
                      placeholder="e.g. A1"
                      required
                      className="w-full border border-gray-300
                                 rounded-xl px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2
                                 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 text-xs mb-1">
                      Type
                    </label>
                    <select
                      value={slotForm.slot_type}
                      onChange={(e) => setSlotForm({
                        ...slotForm,
                        slot_type: e.target.value
                      })}
                      className="w-full border border-gray-300
                                 rounded-xl px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2
                                 focus:ring-blue-500"
                    >
                      <option value="car">Car</option>
                      <option value="bike">Bike</option>
                      <option value="truck">Truck</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-600 text-xs mb-1">
                      Floor
                    </label>
                    <input
                      type="text"
                      value={slotForm.floor}
                      onChange={(e) => setSlotForm({
                        ...slotForm,
                        floor: e.target.value
                      })}
                      placeholder="e.g. Ground"
                      required
                      className="w-full border border-gray-300
                                 rounded-xl px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2
                                 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 text-xs mb-1">
                      Price/Hour (₹)
                    </label>
                    <input
                      type="number"
                      value={slotForm.price_per_hour}
                      onChange={(e) => setSlotForm({
                        ...slotForm,
                        price_per_hour: e.target.value
                      })}
                      placeholder="e.g. 50"
                      required
                      className="w-full border border-gray-300
                                 rounded-xl px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2
                                 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-4 flex gap-3">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700
                                 text-white px-5 py-2 rounded-xl
                                 font-medium transition text-sm"
                    >
                      Add Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddSlot(false)}
                      className="bg-gray-200 hover:bg-gray-300
                                 text-gray-700 px-5 py-2 rounded-xl
                                 font-medium transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3
                            md:grid-cols-4 gap-3">
              {slots.map((slot) => (
                <div key={slot.id}
                  className="bg-white rounded-2xl shadow p-4 text-center">
                  <p className="text-xl font-bold text-gray-800 mb-1">
                    {slot.slot_number}
                  </p>
                  <p className="text-gray-500 text-xs capitalize mb-1">
                    {slot.slot_type} • {slot.floor}
                  </p>
                  <p className="text-blue-700 font-bold text-sm mb-2">
                    ₹{slot.price_per_hour}/hr
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-xs
                                   font-medium ${getStatusColor(slot.status)}`}>
                    {slot.status}
                  </span>

                  <select
                    value={slot.status}
                    onChange={(e) => handleSlotStatus(slot.id, e.target.value)}
                    className="w-full mt-2 border border-gray-200
                               rounded-lg px-2 py-1 text-xs
                               focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>

                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="mt-2 text-red-500 hover:text-red-700
                               text-xs flex items-center gap-1 mx-auto"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              All Bookings
            </h2>

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id}
                  className="bg-white rounded-2xl shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-800">
                        {booking.user_name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {booking.user_email}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs
                                     font-medium
                                     ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div>
                      <p className="text-gray-400 text-xs">Slot</p>
                      <p className="font-medium">{booking.slot_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Vehicle</p>
                      <p className="font-medium">{booking.vehicle_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Amount</p>
                      <p className="font-bold text-green-700">
                        ₹{booking.total_amount}
                      </p>
                    </div>
                  </div>
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCompleteBooking(booking.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700
                                 text-white px-3 py-1.5 rounded-lg
                                 text-xs font-medium transition"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl
                            shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['User', 'Slot', 'Vehicle', 'Amount',
                        'Status', 'Action'].map((h) => (
                        <th key={h}
                          className="text-left px-5 py-3
                                     text-gray-600 font-medium text-sm">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((booking) => (
                      <tr key={booking.id}
                        className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-800 text-sm">
                            {booking.user_name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {booking.user_email}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-800 text-sm">
                            {booking.slot_number}
                          </p>
                          <p className="text-gray-400 text-xs capitalize">
                            {booking.slot_type}
                          </p>
                        </td>
                        <td className="px-5 py-3 font-medium
                                       text-gray-800 text-sm">
                          {booking.vehicle_number}
                        </td>
                        <td className="px-5 py-3 font-bold text-green-700">
                          ₹{booking.total_amount}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 rounded-full
                                           text-xs font-medium
                                           ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleCompleteBooking(booking.id)}
                              className="bg-blue-600 hover:bg-blue-700
                                         text-white px-3 py-1.5 rounded-lg
                                         text-xs font-medium transition"
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              All Users
            </h2>

            {/* Mobile Cards */}
            <div className="block md:hidden space-y-3">
              {users.map((user) => (
                <div key={user.id}
                  className="bg-white rounded-2xl shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">
                        {user.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {user.email}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {user.phone}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs
                                     font-medium
                      ${user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                      {user.role}
                    </span>
                  </div>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="mt-3 text-red-500 text-xs
                                 flex items-center gap-1"
                    >
                      <FaTrash /> Delete User
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl
                            shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Name', 'Email', 'Phone', 'Role',
                      'Joined', 'Action'].map((h) => (
                      <th key={h}
                        className="text-left px-5 py-3
                                   text-gray-600 font-medium text-sm">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id}
                      className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-medium
                                     text-gray-800 text-sm">
                        {user.name}
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-sm">
                        {user.email}
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-sm">
                        {user.phone}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full
                                         text-xs font-medium
                          ${user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-500 hover:text-red-700
                                       flex items-center gap-1 text-sm"
                          >
                            <FaTrash /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {activeTab === 'payments' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              All Payments
            </h2>

            {/* Mobile Cards */}
            <div className="block md:hidden space-y-3">
              {payments.map((payment) => (
                <div key={payment.id}
                  className="bg-white rounded-2xl shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-800">
                        {payment.user_name}
                      </p>
                      <p className="text-gray-500 text-xs capitalize">
                        {payment.payment_method}
                      </p>
                    </div>
                    <p className="font-bold text-green-700">
                      ₹{payment.amount}
                    </p>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">
                    {payment.transaction_id}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs
                                     font-medium
                      ${payment.payment_status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : payment.payment_status === 'refunded'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                      {payment.payment_status}
                    </span>
                    {payment.payment_status === 'completed' && (
                      <button
                        onClick={() => handleRefund(payment.id)}
                        className="bg-yellow-500 hover:bg-yellow-600
                                   text-white px-3 py-1 rounded-lg
                                   text-xs font-medium"
                      >
                        Refund
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl
                            shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['User', 'Transaction ID', 'Method',
                        'Amount', 'Status', 'Date', 'Action'].map((h) => (
                        <th key={h}
                          className="text-left px-5 py-3
                                     text-gray-600 font-medium text-sm">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((payment) => (
                      <tr key={payment.id}
                        className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-800 text-sm">
                            {payment.user_name}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {payment.transaction_id}
                        </td>
                        <td className="px-5 py-3 capitalize text-sm">
                          {payment.payment_method}
                        </td>
                        <td className="px-5 py-3 font-bold text-green-700">
                          ₹{payment.amount}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 rounded-full
                                           text-xs font-medium
                            ${payment.payment_status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : payment.payment_status === 'refunded'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                            }`}>
                            {payment.payment_status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          {payment.payment_status === 'completed' && (
                            <button
                              onClick={() => handleRefund(payment.id)}
                              className="bg-yellow-500 hover:bg-yellow-600
                                         text-white px-3 py-1.5 rounded-lg
                                         text-xs font-medium transition"
                            >
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminDashboard
