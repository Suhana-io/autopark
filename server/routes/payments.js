const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// ─── CREATE PAYMENT ─────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { booking_id, payment_method } = req.body;
    const user_id = req.user.id;

    // Check if booking exists
    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [booking_id, user_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];

    // Check if already paid
    const [existingPayment] = await db.query(
      'SELECT * FROM payments WHERE booking_id = ? AND payment_status = ?',
      [booking_id, 'completed']
    );

    if (existingPayment.length > 0) {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    // Generate transaction ID
    const transaction_id = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);

    // Insert payment
    const [result] = await db.query(
      `INSERT INTO payments 
       (booking_id, user_id, amount, payment_method, payment_status, transaction_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        booking_id,
        user_id,
        booking.total_amount,
        payment_method,
        'completed',
        transaction_id
      ]
    );

    // Update booking status to confirmed if pending
    if (booking.status === 'pending') {
      await db.query(
        'UPDATE bookings SET status = ? WHERE id = ?',
        ['confirmed', booking_id]
      );
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('payment_done', {
      message: 'Payment completed',
      paymentId: result.insertId,
      bookingId: booking_id
    });

    res.status(201).json({
      message: 'Payment successful',
      paymentId: result.insertId,
      transaction_id,
      amount: booking.total_amount,
      payment_method,
      payment_status: 'completed'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET MY PAYMENTS ────────────────────────────────────
router.get('/my', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const [payments] = await db.query(
      `SELECT p.*, 
              b.vehicle_number, b.start_time, b.end_time, 
              b.total_hours, b.status as booking_status,
              s.slot_number, s.slot_type, s.floor
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN parking_slots s ON b.slot_id = s.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [user_id]
    );

    res.status(200).json({ payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET SINGLE PAYMENT ─────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [payments] = await db.query(
      `SELECT p.*, 
              b.vehicle_number, b.start_time, b.end_time,
              b.total_hours, b.status as booking_status,
              s.slot_number, s.slot_type, s.floor,
              u.name as user_name, u.email as user_email
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN parking_slots s ON b.slot_id = s.id
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Only allow owner or admin
    if (payments[0].user_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ payment: payments[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── REFUND PAYMENT (Admin only) ────────────────────────
router.put('/:id/refund', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [payments] = await db.query(
      'SELECT * FROM payments WHERE id = ?',
      [id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const payment = payments[0];

    if (payment.payment_status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }

    // Update payment status to refunded
    await db.query(
      'UPDATE payments SET payment_status = ? WHERE id = ?',
      ['refunded', id]
    );

    // Cancel the related booking
    await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', payment.booking_id]
    );

    // Get booking to free up slot
    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [payment.booking_id]
    );

    if (bookings.length > 0) {
      await db.query(
        'UPDATE parking_slots SET status = ? WHERE id = ?',
        ['available', bookings[0].slot_id]
      );
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('payment_refunded', {
      message: 'Payment refunded',
      paymentId: id,
      bookingId: payment.booking_id
    });

    res.status(200).json({ message: 'Payment refunded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET ALL PAYMENTS (Admin only) ──────────────────────
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT p.*, 
              b.vehicle_number, b.start_time, b.end_time,
              b.total_hours, b.status as booking_status,
              s.slot_number, s.slot_type, s.floor,
              u.name as user_name, u.email as user_email,
              u.phone as user_phone
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN parking_slots s ON b.slot_id = s.id
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );

    res.status(200).json({ payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET PAYMENT STATS (Admin only) ─────────────────────
router.get('/stats/summary', verifyAdmin, async (req, res) => {
  try {
    // Total revenue
    const [revenue] = await db.query(
      `SELECT SUM(amount) as total_revenue 
       FROM payments 
       WHERE payment_status = 'completed'`
    );

    // Total payments count
    const [totalPayments] = await db.query(
      `SELECT COUNT(*) as total 
       FROM payments`
    );

    // Payments by method
    const [byMethod] = await db.query(
      `SELECT payment_method, COUNT(*) as count, SUM(amount) as total
       FROM payments
       WHERE payment_status = 'completed'
       GROUP BY payment_method`
    );

    // Today's revenue
    const [todayRevenue] = await db.query(
      `SELECT SUM(amount) as today_revenue
       FROM payments
       WHERE payment_status = 'completed'
       AND DATE(created_at) = CURDATE()`
    );

    res.status(200).json({
      total_revenue: revenue[0].total_revenue || 0,
      total_payments: totalPayments[0].total,
      payments_by_method: byMethod,
      today_revenue: todayRevenue[0].today_revenue || 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;