const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const QRCode = require('qrcode');

// ─── CREATE BOOKING ─────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { slot_id, vehicle_number, start_time, end_time } = req.body;
    const user_id = req.user.id;

    // Check if slot exists and is available
    const [slots] = await db.query(
      'SELECT * FROM parking_slots WHERE id = ? AND status = ?',
      [slot_id, 'available']
    );

    if (slots.length === 0) {
      return res.status(400).json({ message: 'Slot not available' });
    }

    const slot = slots[0];

    // Calculate total hours and amount
    const start = new Date(start_time);
    const end = new Date(end_time);
    const totalHours = Math.ceil((end - start) / (1000 * 60 * 60));

    if (totalHours <= 0) {
      return res.status(400).json({ message: 'Invalid time range' });
    }

    const totalAmount = totalHours * slot.price_per_hour;

    // Generate QR Code
    const qrData = JSON.stringify({
      user_id,
      slot_id,
      vehicle_number,
      start_time,
      end_time,
      totalAmount
    });

    const qrCode = await QRCode.toDataURL(qrData);

    // Insert booking
    const [result] = await db.query(
      `INSERT INTO bookings 
       (user_id, slot_id, vehicle_number, start_time, end_time, 
        total_hours, total_amount, status, qr_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, slot_id, vehicle_number,
        start_time, end_time,
        totalHours, totalAmount,
        'confirmed', qrCode
      ]
    );

    // Update slot status to booked
    await db.query(
      'UPDATE parking_slots SET status = ? WHERE id = ?',
      ['booked', slot_id]
    );

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('booking_created', {
      message: 'New booking created',
      bookingId: result.insertId
    });
    io.emit('slot_updated', {
      message: 'Slot booked',
      slotId: slot_id,
      status: 'booked'
    });

    res.status(201).json({
      message: 'Booking confirmed successfully',
      bookingId: result.insertId,
      totalHours,
      totalAmount,
      qrCode
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET MY BOOKINGS ────────────────────────────────────
router.get('/my', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const [bookings] = await db.query(
      `SELECT b.*, 
              p.slot_number, p.slot_type, p.floor, p.price_per_hour 
       FROM bookings b 
       JOIN parking_slots p ON b.slot_id = p.id 
       WHERE b.user_id = ? 
       ORDER BY b.created_at DESC`,
      [user_id]
    );

    res.status(200).json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET SINGLE BOOKING ─────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [bookings] = await db.query(
      `SELECT b.*, 
              p.slot_number, p.slot_type, p.floor, p.price_per_hour,
              u.name as user_name, u.email as user_email, u.phone as user_phone
       FROM bookings b 
       JOIN parking_slots p ON b.slot_id = p.id 
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only allow user to see their own booking or admin
    if (bookings[0].user_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ booking: bookings[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── CANCEL BOOKING ─────────────────────────────────────
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Get booking
    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];

    // Only allow owner or admin to cancel
    if (booking.user_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    // Cancel booking
    await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', id]
    );

    // Free up the slot
    await db.query(
      'UPDATE parking_slots SET status = ? WHERE id = ?',
      ['available', booking.slot_id]
    );

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('booking_cancelled', {
      message: 'Booking cancelled',
      bookingId: id
    });
    io.emit('slot_updated', {
      message: 'Slot now available',
      slotId: booking.slot_id,
      status: 'available'
    });

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── COMPLETE BOOKING ───────────────────────────────────
router.put('/:id/complete', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be completed' });
    }

    // Complete booking
    await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['completed', id]
    );

    // Free up the slot
    await db.query(
      'UPDATE parking_slots SET status = ? WHERE id = ?',
      ['available', booking.slot_id]
    );

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('booking_completed', {
      message: 'Booking completed',
      bookingId: id
    });
    io.emit('slot_updated', {
      message: 'Slot now available',
      slotId: booking.slot_id,
      status: 'available'
    });

    res.status(200).json({ message: 'Booking completed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;