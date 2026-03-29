import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import API_URL from '../api'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

import {
  FaCar, FaParking, FaClock, FaMoneyBillWave,
  FaQrcode, FaTimesCircle, FaCheckCircle,
  FaPrint, FaDownload
} from 'react-icons/fa'

const BookingDetails = () => {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const receiptRef = useRef()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')

  useEffect(() => {
    fetchBooking()
  }, [id])

  const fetchBooking = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/bookings/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setBooking(res.data.booking)
    } catch (err) {
      toast.error('Failed to load booking details')
      navigate('/my-bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setCancelLoading(true)
    try {
      await axios.put(
        `${API_URL}/api/bookings/${id}/cancel`,

        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Booking cancelled successfully')
      fetchBooking()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed')
    } finally {
      setCancelLoading(false)
    }
  }

  const handlePayment = async () => {
    setPayLoading(true)
    try {
      await axios.post(
        `${API_URL}/api/payments`,
        {
          booking_id: booking.id,
          payment_method: paymentMethod
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Payment successful! 🎉')
      fetchBooking()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed')
    } finally {
      setPayLoading(false)
    }
  }

  // ─── PRINT RECEIPT ──────────────────────────────────────
  const handlePrint = () => {
    const printContent = document.getElementById('receipt')
    const originalContent = document.body.innerHTML
    document.body.innerHTML = printContent.innerHTML
    window.print()
    document.body.innerHTML = originalContent
    window.location.reload()
  }

  // ─── DOWNLOAD PDF ───────────────────────────────────────
  const handleDownloadPDF = async () => {
    const receipt = document.getElementById('receipt')
    toast.loading('Generating PDF...')

    try {
      const canvas = await html2canvas(receipt, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        scrollY: 0,
        windowWidth: receipt.scrollWidth,
        windowHeight: receipt.scrollHeight
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      // Add new pages if receipt is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      pdf.save(`AutoPark-Receipt-${booking.id}.pdf`)
      toast.dismiss()
      toast.success('Receipt downloaded! 🎉')

    } catch (err) {
      toast.dismiss()
      toast.error('Download failed')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300'
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-300'
      default: return 'bg-gray-100 text-gray-700'
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

  if (!booking) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Booking Details
            </h1>
            <p className="text-gray-500">Booking ID: #{booking.id}</p>
          </div>
          <span className={`px-5 py-2 rounded-full font-bold border
                           text-lg ${getStatusColor(booking.status)}`}>
            {booking.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Booking Info Card */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4
                           flex items-center gap-2">
              <FaParking className="text-blue-600" />
              Parking Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Slot Number</span>
                <span className="font-bold text-gray-800">
                  {booking.slot_number}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Slot Type</span>
                <span className="font-bold text-gray-800 capitalize">
                  {booking.slot_type}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Floor</span>
                <span className="font-bold text-gray-800">
                  {booking.floor}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Vehicle Number</span>
                <span className="font-bold text-gray-800">
                  {booking.vehicle_number}
                </span>
              </div>
            </div>
          </div>

          {/* Time & Amount Card */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4
                           flex items-center gap-2">
              <FaClock className="text-green-600" />
              Time & Amount
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Start Time</span>
                <span className="font-bold text-gray-800">
                  {new Date(booking.start_time).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">End Time</span>
                <span className="font-bold text-gray-800">
                  {new Date(booking.end_time).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Total Hours</span>
                <span className="font-bold text-gray-800">
                  {booking.total_hours} hrs
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Rate</span>
                <span className="font-bold text-gray-800">
                  ₹{booking.price_per_hour}/hr
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-bold text-green-700 text-xl">
                  ₹{booking.total_amount}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code Card */}
          {booking.status === 'confirmed' && booking.qr_code && (
            <div className="bg-white rounded-2xl shadow p-6 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4
                             flex items-center gap-2 justify-center">
                <FaQrcode className="text-purple-600" />
                Your Entry QR Code
              </h2>
              <div className="flex justify-center mb-4">
                <img
                  src={booking.qr_code}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-gray-500 text-sm">
                Show this QR code at the parking entry
              </p>
            </div>
          )}

          {/* Payment Card */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4
                           flex items-center gap-2">
              <FaMoneyBillWave className="text-yellow-500" />
              Payment
            </h2>

            {booking.status === 'confirmed' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl
                               px-4 py-3 focus:outline-none focus:ring-2
                               focus:ring-blue-500"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="card">💳 Card</option>
                    <option value="upi">📱 UPI</option>
                  </select>
                </div>

                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-gray-500 text-sm">Amount to Pay</p>
                  <p className="text-3xl font-bold text-green-700">
                    ₹{booking.total_amount}
                  </p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={payLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white
                             font-bold py-3 rounded-xl transition
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {payLoading ? 'Processing...' : '💳 Pay Now'}
                </button>
              </div>
            ) : booking.status === 'cancelled' ? (
              <div className="text-center py-4">
                <FaTimesCircle className="text-red-400 text-4xl mx-auto mb-2" />
                <p className="text-red-500 font-medium">Booking Cancelled</p>
              </div>
            ) : booking.status === 'completed' ? (
              <div className="text-center py-4">
                <FaCheckCircle className="text-blue-400 text-4xl mx-auto mb-2" />
                <p className="text-blue-500 font-medium">Booking Completed</p>
              </div>
            ) : null}
          </div>

        </div>

        {/* Print & Download Buttons */}
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <button
            onClick={handlePrint}
            className="bg-blue-700 hover:bg-blue-800 text-white
                       px-6 py-3 rounded-xl font-bold transition
                       flex items-center gap-2"
          >
            <FaPrint /> Print Receipt
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-green-600 hover:bg-green-700 text-white
                       px-6 py-3 rounded-xl font-bold transition
                       flex items-center gap-2"
          >
            <FaDownload /> Download PDF
          </button>
        </div>

        {/* Cancel Button */}
        {(booking.status === 'confirmed' ||
          booking.status === 'pending') && (
          <div className="mt-4 text-center">
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="bg-red-500 hover:bg-red-600 text-white
                         px-8 py-3 rounded-xl font-bold transition
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cancelLoading ? 'Cancelling...' : '❌ Cancel Booking'}
            </button>
          </div>
        )}

        {/* Receipt - Used for Print/Download */}
        <div
          id="receipt"
          className="bg-white p-8 mt-8 rounded-2xl shadow-lg
                     max-w-md mx-auto"
        >
          {/* Receipt Header */}
          <div className="text-center border-b-2 border-dashed
                          border-gray-300 pb-4 mb-4">
            <div className="flex justify-center mb-2">
              <span className="text-5xl">🚗</span>
            </div>
            <h1 className="text-2xl font-bold text-blue-700">
              AutoPark
            </h1>
            <p className="text-gray-500 text-sm">
              Smart Parking Management
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {new Date().toLocaleString()}
            </p>
          </div>

          {/* Receipt Status */}
          <div className="text-center mb-4">
            <span className={`px-4 py-1 rounded-full text-sm font-bold
              ${booking.status === 'confirmed'
                ? 'bg-green-100 text-green-700'
                : booking.status === 'cancelled'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
              }`}>
              {booking.status.toUpperCase()}
            </span>
            <p className="text-gray-500 text-sm mt-2">
              Booking ID: #{booking.id}
            </p>
          </div>

          {/* Receipt Details */}
          <div className="space-y-2 mb-4">

            <div className="flex justify-between py-1
                            border-b border-gray-100">
              <span className="text-gray-500 text-sm">User Name</span>
              <span className="font-medium text-gray-800 text-sm">
                {booking.user_name}
              </span>
            </div>

            <div className="flex justify-between py-1
                            border-b border-gray-100">
              <span className="text-gray-500 text-sm">Vehicle Number</span>
              <span className="font-medium text-gray-800 text-sm">
                {booking.vehicle_number}
              </span>
            </div>

            <div className="flex justify-between py-1
                            border-b border-gray-100">
              <span className="text-gray-500 text-sm">Slot Number</span>
              <span className="font-medium text-gray-800 text-sm">
                {booking.slot_number}
              </span>
            </div>

            <div className="flex justify-between py-1
                            border-b border-gray-100">
              <span className="text-gray-500 text-sm">Slot Type</span>
              <span className="font-medium text-gray-800 text-sm capitalize">
                {booking.slot_type}
              </span>
            </div>

            <div className="flex justify-between py-1
                            border-b border-gray-100">
              <span className="text-gray-500 text-sm">Floor</span>
              <span className="font-medium text-gray-800 text-sm">
                {booking.floor}
              </span>
            </div>

            <div className="flex justify-between py-1
                            border-b border-gray-100">
              <span className="text-gray-500 text-sm">Start Time</span>
              <span className="font-medium text-gray-800 text-sm">
                {new Date(booking.start_time).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-1
                            border-b border-gray-100">
              <span className="text-gray-500 text-sm">End Time</span>
              <span className="font-medium text-gray-800 text-sm">
                {new Date(booking.end_time).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-1
                            border-b border-gray-100">
              <span className="text-gray-500 text-sm">Total Hours</span>
              <span className="font-medium text-gray-800 text-sm">
                {booking.total_hours} hrs
              </span>
            </div>

            <div className="flex justify-between py-1
                            border-b border-gray-100">
              <span className="text-gray-500 text-sm">Rate</span>
              <span className="font-medium text-gray-800 text-sm">
                ₹{booking.price_per_hour}/hr
              </span>
            </div>

          </div>

          {/* Total Amount */}
          <div className="bg-blue-50 border-2 border-blue-200
                          rounded-xl p-4 text-center mb-4 mt-2">
            <p className="text-gray-500 text-sm mb-1">
              Total Amount Paid
            </p>
            <p className="text-4xl font-bold text-blue-700">
              ₹{booking.total_amount}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {booking.total_hours} hrs ×
              ₹{booking.price_per_hour}/hr
            </p>
          </div>

          {/* QR Code */}
          {booking.qr_code && (
            <div className="text-center mb-4">
              <img
                src={booking.qr_code}
                alt="QR Code"
                className="w-32 h-32 mx-auto"
              />
              <p className="text-gray-400 text-xs mt-1">
                Show at parking entry
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center border-t-2 border-dashed
                          border-gray-300 pt-4">
            <p className="text-gray-400 text-xs">
              Thank you for using AutoPark! 🚗
            </p>
            <p className="text-gray-400 text-xs">
              For support: support@autopark.com
            </p>
            <p className="text-gray-300 text-xs mt-2">
              *** This is a computer generated receipt ***
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}

export default BookingDetails
