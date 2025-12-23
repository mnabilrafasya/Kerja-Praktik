const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'surat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Hanya file PDF, DOC, DOCX, JPG, JPEG, PNG yang diperbolehkan'));
  }
});

// GET semua surat dengan filter
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { tahun, unit, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT DISTINCT s.*, 
        GROUP_CONCAT(DISTINCT u.kode_unit ORDER BY u.kode_unit SEPARATOR ', ') as unit_list
      FROM surat s
      LEFT JOIN surat_unit su ON s.id_surat = su.id_surat
      LEFT JOIN unit u ON su.id_unit = u.id_unit
      WHERE 1=1
    `;
    
    const params = [];

    if (tahun) {
      query += ' AND s.tahun = ?';
      params.push(tahun);
    }

    if (unit) {
      query += ' AND u.kode_unit = ?';
      params.push(unit);
    }

    if (search) {
      query += ' AND (s.pengirim LIKE ? OR s.nomor_surat LIKE ? OR s.perihal LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' GROUP BY s.id_surat ORDER BY s.tanggal_surat DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [surat] = await db.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT s.id_surat) as total
      FROM surat s
      LEFT JOIN surat_unit su ON s.id_surat = su.id_surat
      LEFT JOIN unit u ON su.id_unit = u.id_unit
      WHERE 1=1
    `;
    const countParams = params.slice(0, -2);
    const [countResult] = await db.query(countQuery.replace(' GROUP BY s.id_surat ORDER BY s.tanggal_surat DESC LIMIT ? OFFSET ?', ''), countParams);

    res.json({
      data: surat,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
});

// GET surat by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [surat] = await db.query(
      `SELECT s.*, GROUP_CONCAT(u.kode_unit SEPARATOR ', ') as unit_list
       FROM surat s
       LEFT JOIN surat_unit su ON s.id_surat = su.id_surat
       LEFT JOIN unit u ON su.id_unit = u.id_unit
       WHERE s.id_surat = ?
       GROUP BY s.id_surat`,
      [req.params.id]
    );

    if (surat.length === 0) {
      return res.status(404).json({ message: 'Surat tidak ditemukan' });
    }

    res.json(surat[0]);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
});

// POST tambah surat
router.post('/', authMiddleware, upload.single('file_surat'), async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { pengirim, nomor_surat, tanggal_surat, perihal, tahun, unit_ids } = req.body;
    const file_surat = req.file ? req.file.filename : null;

    const [result] = await connection.query(
      'INSERT INTO surat (pengirim, nomor_surat, tanggal_surat, perihal, tahun, file_surat) VALUES (?, ?, ?, ?, ?, ?)',
      [pengirim, nomor_surat, tanggal_surat, perihal, tahun, file_surat]
    );

    const id_surat = result.insertId;

    if (unit_ids) {
      const unitArray = JSON.parse(unit_ids);
      for (const id_unit of unitArray) {
        await connection.query(
          'INSERT INTO surat_unit (id_surat, id_unit) VALUES (?, ?)',
          [id_surat, id_unit]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Surat berhasil ditambahkan', id_surat });
  } catch (error) {
    await connection.rollback();
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  } finally {
    connection.release();
  }
});

// PUT update surat
router.put('/:id', authMiddleware, upload.single('file_surat'), async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { pengirim, nomor_surat, tanggal_surat, perihal, tahun, unit_ids } = req.body;
    
    const [oldSurat] = await connection.query('SELECT file_surat FROM surat WHERE id_surat = ?', [req.params.id]);
    
    if (oldSurat.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Surat tidak ditemukan' });
    }

    let file_surat = oldSurat[0].file_surat;
    
    if (req.file) {
      if (file_surat && fs.existsSync(`./uploads/${file_surat}`)) {
        fs.unlinkSync(`./uploads/${file_surat}`);
      }
      file_surat = req.file.filename;
    }

    await connection.query(
      'UPDATE surat SET pengirim = ?, nomor_surat = ?, tanggal_surat = ?, perihal = ?, tahun = ?, file_surat = ? WHERE id_surat = ?',
      [pengirim, nomor_surat, tanggal_surat, perihal, tahun, file_surat, req.params.id]
    );

    await connection.query('DELETE FROM surat_unit WHERE id_surat = ?', [req.params.id]);

    if (unit_ids) {
      const unitArray = JSON.parse(unit_ids);
      for (const id_unit of unitArray) {
        await connection.query(
          'INSERT INTO surat_unit (id_surat, id_unit) VALUES (?, ?)',
          [req.params.id, id_unit]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Surat berhasil diupdate' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  } finally {
    connection.release();
  }
});

// DELETE surat
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [surat] = await db.query('SELECT file_surat FROM surat WHERE id_surat = ?', [req.params.id]);
    
    if (surat.length === 0) {
      return res.status(404).json({ message: 'Surat tidak ditemukan' });
    }

    if (surat[0].file_surat && fs.existsSync(`./uploads/${surat[0].file_surat}`)) {
      fs.unlinkSync(`./uploads/${surat[0].file_surat}`);
    }

    await db.query('DELETE FROM surat WHERE id_surat = ?', [req.params.id]);
    
    res.json({ message: 'Surat berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
});

module.exports = router;