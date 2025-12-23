// Script untuk membuat user admin dengan password yang sudah di-hash
const bcrypt = require('bcrypt');
const db = require('./config/database');

async function seedAdmin() {
  try {
    const username = 'admin';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin exists
    const [existingAdmin] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (existingAdmin.length > 0) {
      console.log('Admin user sudah ada, akan diupdate passwordnya...');
      await db.query('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username]);
      console.log('Password admin berhasil diupdate!');
    } else {
      console.log('Membuat user admin baru...');
      await db.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, 'admin']
      );
      console.log('User admin berhasil dibuat!');
    }

    console.log('\nInformasi Login:');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('\nPassword Hash:', hashedPassword);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedAdmin();