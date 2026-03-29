const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// ─── GET ALL SLOTS ──────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [slots] = await db.query(
      'SELECT * FROM parking_slots ORDER BY slot_number ASC'
    );
    res.status(200).json({ slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET AVAILABLE SLOTS ────────────────────────────────
router.get('/available', async (req, res) => {
  try {
    const [slots] = await db.query(
      'SELECT * FROM parking_slots WHERE status = ? ORDER BY slot_number ASC',
      ['available']
    );
    res.status(200).json({ slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET SINGLE SLOT ────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [slots] = await db.query(
      'SELECT * FROM parking_slots WHERE id = ?',
      [id]
    );

    if (slots.length === 0) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    res.status(200).json({ slot: slots[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ADD NEW SLOT (Admin only) ──────────────────────────
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { slot_number, slot_type, floor, price_per_hour } = req.body;

    // Check if slot number already exists
    const [existing] = await db.query(
      'SELECT * FROM parking_slots WHERE slot_number = ?',
      [slot_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Slot number already exists' });
    }

    await db.query(
      `INSERT INTO parking_slots 
       (slot_number, slot_type, floor, price_per_hour, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [slot_number, slot_type, floor, price_per_hour, 'available']
    );

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('slot_updated', { message: 'New slot added' });

    res.status(201).json({ message: 'Slot added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── UPDATE SLOT (Admin only) ───────────────────────────
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { slot_number, slot_type, floor, price_per_hour, status } = req.body;

    const [existing] = await db.query(
      'SELECT * FROM parking_slots WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    await db.query(
      `UPDATE parking_slots 
       SET slot_number = ?, slot_type = ?, floor = ?, 
           price_per_hour = ?, status = ? 
       WHERE id = ?`,
      [slot_number, slot_type, floor, price_per_hour, status, id]
    );

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('slot_updated', { message: 'Slot updated', slotId: id });

    res.status(200).json({ message: 'Slot updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── DELETE SLOT (Admin only) ───────────────────────────
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      'SELECT * FROM parking_slots WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    await db.query(
      'DELETE FROM parking_slots WHERE id = ?',
      [id]
    );

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('slot_updated', { message: 'Slot deleted', slotId: id });

    res.status(200).json({ message: 'Slot deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── UPDATE SLOT STATUS ONLY (Admin only) ───────────────
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['available', 'booked', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    await db.query(
      'UPDATE parking_slots SET status = ? WHERE id = ?',
      [status, id]
    );

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('slot_updated', { message: 'Slot status changed', slotId: id, status });

    res.status(200).json({ message: 'Slot status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;