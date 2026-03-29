import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import API_URL from '../api'
import toast from 'react-hot-toast'
import { FaCar, FaMotorcycle, FaTruck, FaParking } from 'react-icons/fa'

const Booking = () => {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  const [formData, setFormData] = useState({
    vehicle_number: '',
    start_time: '',
    end_time: ''
  })

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const res = await axios.get(
  `${API_URL}/api/slots/available`
)
      setSlots(res.data.slots)
    } catch (err) {
      toast.error('Failed to load slots')
    } finally {
      setLoading(false)
    }
  }

  const getSlotIcon = (type) => {
    switch (type) {
      case 'bike': return <FaMotorcycle className="text-2xl" />
      case 'truck': return <FaTruck className="text-2xl" />
      default: return <FaCar className="text-2xl" />
    }
  }

  const getSlotColor = (type) => {
    switch (type) {
      case 'bike': return 'border-green-400 bg-green-50 text-green-700'
      case 'truck': return 'border-red-400 bg-red-50 text-red-700'
      default: return 'border-blue-400 bg-blue-50 text-blue-700'
    }
  }

  const filteredSlots = filterType === 'all'
    ? slots
    : slots.filter(s => s.slot_type === filterType)

  const calculateAmount = () => {
    if (!selectedSlot || !formData.start_time || !formData.end_time) return 0
    const start = new Date(formData.start_time)
    const end = new Date(formData.end_time)
    const hours = Math.ceil((end - start) / (1000 * 60 * 60))
    return hours > 0 ? hours * selectedSlot.price_per_hour : 0
  }

  const handleBooking = async (e) => {
    e.preventDefault()

    if (!selectedSlot) {
      toast.error('Please select a parking slot!')
      return
    }

    if (!formData.start_time || !formData.end_time) {
      toast.error('Please select start and end time!')
      return
    }

    const start = new Date(formData.start_time)
    const end = new Date(formData.end_time)

    if (end <= start) {
      toast.error('End time must be after start time!')
      return
    }

    setBookingLoading(true)

    try {
      const res = await axios.post(
  `${API_URL}/api/bookings`,
        {
          slot_id: selectedSlot.id,
          vehicle_number: formData.vehicle_number,
          start_time: formData.start_time,
          end_time: formData.end_time
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success('Booking confirmed! 🎉')
      navigate(`/booking/${res.data.bookingId}`)

    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setBookingLoading(false)
    }
  }

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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Book a Parking Slot
        </h1>
        <p className="text-gray-500 mb-8">
          Select your preferred slot and enter booking details
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left - Slot Selection */}
          <div className="lg:col-span-2">

            {/* Filter Buttons */}
            <div className="flex gap-3 mb-6 flex-wrap">
              {['all', 'car', 'bike', 'truck'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-5 py-2 rounded-xl font-medium capitalize transition
                    ${filterType === type
                      ? 'bg-blue-700 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {type === 'all' ? '🅿️ All' :
                   type === 'car' ? '🚗 Car' :
                   type === 'bike' ? '🏍️ Bike' : '🚛 Truck'}
                </button>
              ))}
            </div>

            {/* Slots Grid */}
            {filteredSlots.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-12 text-center">
                <FaParking className="text-gray-300 text-6xl mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No slots available for this type
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`border-2 rounded-2xl p-4 cursor-pointer 
                                transition hover:shadow-md text-center
                                ${selectedSlot?.id === slot.id
                                  ? 'border-blue-600 bg-blue-50 shadow-md'
                                  : getSlotColor(slot.slot_type)
                                }`}
                  >
                    <div className="flex justify-center mb-2">
                      {getSlotIcon(slot.slot_type)}
                    </div>
                    <p className="text-2xl font-bold">{slot.slot_number}</p>
                    <p className="text-sm capitalize">{slot.slot_type}</p>
                    <p className="text-xs text-gray-500">{slot.floor}</p>
                    <p className="font-bold mt-2">₹{slot.price_per_hour}/hr</p>
                    {selectedSlot?.id === slot.id && (
                      <p className="text-blue-600 text-xs font-bold mt-1">
                        ✓ Selected
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right - Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Booking Details
              </h2>

              {/* Selected Slot Info */}
              {selectedSlot ? (
                <div className="bg-blue-50 border border-blue-200 
                                rounded-xl p-4 mb-6">
                  <p className="font-bold text-blue-800">
                    Selected: Slot {selectedSlot.slot_number}
                  </p>
                  <p className="text-blue-600 text-sm capitalize">
                    {selectedSlot.slot_type} • {selectedSlot.floor}
                  </p>
                  <p className="text-blue-600 font-bold">
                    ₹{selectedSlot.price_per_hour}/hour
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 
                                rounded-xl p-4 mb-6 text-center">
                  <p className="text-gray-400">
                    👆 Select a slot from the left
                  </p>
                </div>
              )}

              <form onSubmit={handleBooking} className="space-y-4">

                {/* Vehicle Number */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({
                      ...formData,
                      vehicle_number: e.target.value.toUpperCase()
                    })}
                    placeholder="e.g. TS09AB1234"
                    required
                    className="w-full border border-gray-300 rounded-xl 
                               px-4 py-3 focus:outline-none focus:ring-2 
                               focus:ring-blue-500 transition"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({
                      ...formData,
                      start_time: e.target.value
                    })}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                    className="w-full border border-gray-300 rounded-xl 
                               px-4 py-3 focus:outline-none focus:ring-2 
                               focus:ring-blue-500 transition"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({
                      ...formData,
                      end_time: e.target.value
                    })}
                    min={formData.start_time}
                    required
                    className="w-full border border-gray-300 rounded-xl 
                               px-4 py-3 focus:outline-none focus:ring-2 
                               focus:ring-blue-500 transition"
                  />
                </div>

                {/* Amount Preview */}
                {calculateAmount() > 0 && (
                  <div className="bg-green-50 border border-green-200 
                                  rounded-xl p-4">
                    <p className="text-gray-600 text-sm">Estimated Amount</p>
                    <p className="text-2xl font-bold text-green-700">
                      ₹{calculateAmount()}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={bookingLoading || !selectedSlot}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white 
                             font-bold py-3 rounded-xl transition
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Booking