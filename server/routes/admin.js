const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyAdmin } = require('../middleware/auth');

// ─── GET DASHBOARD STATS ────────────────────────────────
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    // Total users
    const [totalUsers] = await db.query(
      `SELECT COUNT(*) as total FROM users WHERE role = 'user'`
    );

    // Total slots
    const [totalSlots] = await db.query(
      `SELECT COUNT(*) as total FROM parking_slots`
    );

    // Available slots
    const [availableSlots] = await db.query(
      `SELECT COUNT(*) as total FROM parking_slots WHERE status = 'available'`
    );

    // Booked slots
    const [bookedSlots] = await db.query(
      `SELECT COUNT(*) as total FROM parking_slots WHERE status = 'booked'`
    );

    // Total bookings
    const [totalBookings] = await db.query(
      `SELECT COUNT(*) as total FROM bookings`
    );

    // Active bookings
    const [activeBookings] = await db.query(
      `SELECT COUNT(*) as total FROM bookings WHERE status = 'confirmed'`
    );

    // Cancelled bookings
    const [cancelledBookings] = await db.query(
      `SELECT COUNT(*) as total FROM bookings WHERE status = 'cancelled'`
    );

    // Completed bookings
    const [completedBookings] = await db.query(
      `SELECT COUNT(*) as total FROM bookings WHERE status = 'completed'`
    );

    // Total revenue
    const [totalRevenue] = await db.query(
      `SELECT SUM(amount) as total 
       FROM payments 
       WHERE payment_status = 'completed'`
    );

    // Today's revenue
    const [todayRevenue] = await db.query(
      `SELECT SUM(amount) as total 
       FROM payments 
       WHERE payment_status = 'completed' 
       AND DATE(created_at) = CURDATE()`
    );

    // Today's bookings
    const [todayBookings] = await db.query(
      `SELECT COUNT(*) as total 
       FROM bookings 
       WHERE DATE(created_at) = CURDATE()`
    );

    // Monthly revenue (last 6 months)
    const [monthlyRevenue] = await db.query(
      `SELECT 
         DATE_FORMAT(created_at, '%Y-%m') as month,
         SUM(amount) as revenue
       FROM payments
       WHERE payment_status = 'completed'
       AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );

    res.status(200).json({
      users: {
        total: totalUsers[0].total
      },
      slots: {
        total: totalSlots[0].total,
        available: availableSlots[0].total,
        booked: bookedSlots[0].total
      },
      bookings: {
        total: totalBookings[0].total,
        active: activeBookings[0].total,
        cancelled: cancelledBookings[0].total,
        completed: completedBookings[0].total,
        today: todayBookings[0].total
      },
      revenue: {
        total: totalRevenue[0].total || 0,
        today: todayRevenue[0].total || 0,
        monthly: monthlyRevenue
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET ALL USERS ──────────────────────────────────────
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, name, email, phone, role, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET SINGLE USER ────────────────────────────────────
router.get('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      `SELECT id, name, email, phone, role, created_at 
       FROM users WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user bookings
    const [bookings] = await db.query(
      `SELECT b.*, s.slot_number, s.slot_type, s.floor
       FROM bookings b
       JOIN parking_slots s ON b.slot_id = s.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [id]
    );

    res.status(200).json({
      user: users[0],
      bookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── DELETE USER ────────────────────────────────────────
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (users[0].role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET ALL BOOKINGS ───────────────────────────────────
router.get('/bookings', verifyAdmin, async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.*,
              u.name as user_name, u.email as user_email, u.phone as user_phone,
              s.slot_number, s.slot_type, s.floor, s.price_per_hour
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN parking_slots s ON b.slot_id = s.id
       ORDER BY b.created_at DESC`
    );

    res.status(200).json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET RECENT ACTIVITY ────────────────────────────────
router.get('/activity', verifyAdmin, async (req, res) => {
  try {
    // Recent bookings
    const [recentBookings] = await db.query(
      `SELECT b.id, b.status, b.created_at,
              u.name as user_name,
              s.slot_number
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN parking_slots s ON b.slot_id = s.id
       ORDER BY b.created_at DESC
       LIMIT 10`
    );

    // Recent payments
    const [recentPayments] = await db.query(
      `SELECT p.id, p.amount, p.payment_method,
              p.payment_status, p.transaction_id, p.created_at,
              u.name as user_name
       FROM payments p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT 10`
    );

    res.status(200).json({
      recentBookings,
      recentPayments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── CHANGE USER ROLE ───────────────────────────────────
router.put('/users/:id/role', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );

    res.status(200).json({ message: `User role updated to ${role}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET SLOT OCCUPANCY REPORT ──────────────────────────
router.get('/reports/slots', verifyAdmin, async (req, res) => {
  try {
    const [report] = await db.query(
      `SELECT 
         s.slot_number, s.slot_type, s.floor, s.status,
         COUNT(b.id) as total_bookings,
         SUM(b.total_amount) as total_revenue
       FROM parking_slots s
       LEFT JOIN bookings b ON s.id = b.slot_id
       GROUP BY s.id
       ORDER BY s.slot_number ASC`
    );

    res.status(200).json({ report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;