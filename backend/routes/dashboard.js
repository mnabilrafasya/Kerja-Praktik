const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET statistik dashboard
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [totalSurat] = await db.query('SELECT COUNT(*) as total FROM surat');
    
    const [suratTahunIni] = await db.query(
      'SELECT COUNT(*) as total FROM surat WHERE tahun = YEAR(CURDATE())'
    );
    
    const [suratPerUnit] = await db.query(`
      SELECT u.kode_unit, u.nama_unit, COUNT(su.id_surat) as jumlah
      FROM unit u
      LEFT JOIN surat_unit su ON u.id_unit = su.id_unit
      GROUP BY u.id_unit
      ORDER BY jumlah DESC
    `);
    
    const [suratPerBulan] = await db.query(`
      SELECT 
        MONTH(tanggal_surat) as bulan,
        MONTHNAME(tanggal_surat) as nama_bulan,
        COUNT(*) as jumlah
      FROM surat
      WHERE YEAR(tanggal_surat) = YEAR(CURDATE())
      GROUP BY MONTH(tanggal_surat)
      ORDER BY MONTH(tanggal_surat)
    `);

    const [recentSurat] = await db.query(`
      SELECT s.*, 
        GROUP_CONCAT(u.kode_unit SEPARATOR ', ') as unit_list
      FROM surat s
      LEFT JOIN surat_unit su ON s.id_surat = su.id_surat
      LEFT JOIN unit u ON su.id_unit = u.id_unit
      GROUP BY s.id_surat
      ORDER BY s.created_at DESC
      LIMIT 5
    `);

    res.json({
      totalSurat: totalSurat[0].total,
      suratTahunIni: suratTahunIni[0].total,
      suratPerUnit,
      suratPerBulan,
      recentSurat
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
});

module.exports = router;