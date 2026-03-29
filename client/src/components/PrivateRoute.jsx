import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useAuth()

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  // Admin only route but user is not admin
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PrivateRoute