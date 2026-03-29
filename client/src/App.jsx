import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import Booking from './pages/Booking'
import BookingDetails from './pages/BookingDetails'
import MyBookings from './pages/MyBookings'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected User Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/booking" element={
            <PrivateRoute>
              <Booking />
            </PrivateRoute>
          } />
          <Route path="/booking/:id" element={
            <PrivateRoute>
              <BookingDetails />
            </PrivateRoute>
          } />
          <Route path="/my-bookings" element={
            <PrivateRoute>
              <MyBookings />
            </PrivateRoute>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute adminOnly={true}>
              <AdminDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App