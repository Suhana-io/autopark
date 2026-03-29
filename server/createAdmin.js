const bcrypt = require('bcryptjs');
const db = require('./database');

async function createAdmin() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Delete existing admin
    await db.query(
      'DELETE FROM users WHERE email = ?',
      ['admin@autopark.com']
    );

    // Insert new admin
    await db.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      ['Admin', 'admin@autopark.com', hashedPassword, '9999999999', 'admin']
    );

    console.log('✅ Admin created successfully!');
    console.log('Email: admin@autopark.com');
    console.log('Password: admin123');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createAdmin();