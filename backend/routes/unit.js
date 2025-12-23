const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET semua unit
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [units] = await db.query('SELECT * FROM unit ORDER BY kode_unit');
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
});

// POST tambah unit
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { kode_unit, nama_unit } = req.body;

    await db.query(
      'INSERT INTO unit (kode_unit, nama_unit) VALUES (?, ?)',
      [kode_unit, nama_unit]
    );

    res.status(201).json({ message: 'Unit berhasil ditambahkan' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Kode unit sudah digunakan' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
});

// PUT update unit
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { kode_unit, nama_unit } = req.body;

    await db.query(
      'UPDATE unit SET kode_unit = ?, nama_unit = ? WHERE id_unit = ?',
      [kode_unit, nama_unit, req.params.id]
    );

    res.json({ message: 'Unit berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
});

// DELETE unit
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM unit WHERE id_unit = ?', [req.params.id]);
    res.json({ message: 'Unit berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
});

module.exports = router;