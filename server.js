
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Koneksi database MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Tes koneksi database
app.get('/', (req, res) => {
    res.send('Backend Data Siswa berhasil berjalan!');
});

app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SHOW TABLES');
        res.json({
            message: 'Koneksi database berhasil!',
            tables: rows
        });
    } catch (error) {
        res.status(500).json({
            message: 'Koneksi database gagal',
            error: error.message
        });
    }
});


// ===============================
// CRUD DATA SISWA
// ===============================

// 1. Menampilkan semua data siswa
app.get('/api/siswa', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM siswa ORDER BY kode_siswa'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Menambahkan data siswa
app.post('/api/siswa', async (req, res) => {
    try {
        const {
            kode_siswa,
            nama_siswa,
            alamat_siswa,
            tgl_siswa,
            jurusan_siswa
        } = req.body;

        await db.query(
            `INSERT INTO siswa
            (kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, jurusan_siswa)
            VALUES (?, ?, ?, ?, ?)`,
            [kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, jurusan_siswa]
        );

        res.status(201).json({
            message: 'Data siswa berhasil ditambahkan!'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Mengubah data siswa
app.put('/api/siswa/:kode_siswa', async (req, res) => {
    try {
        const {
            nama_siswa,
            alamat_siswa,
            tgl_siswa,
            jurusan_siswa
        } = req.body;

        const [result] = await db.query(
            `UPDATE siswa SET
            nama_siswa = ?,
            alamat_siswa = ?,
            tgl_siswa = ?,
            jurusan_siswa = ?
            WHERE kode_siswa = ?`,
            [
                nama_siswa,
                alamat_siswa,
                tgl_siswa,
                jurusan_siswa,
                req.params.kode_siswa
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Data siswa tidak ditemukan!'
            });
        }

        res.json({ message: 'Data siswa berhasil diubah!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Menghapus data siswa
app.delete('/api/siswa/:kode_siswa', async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM siswa WHERE kode_siswa = ?',
            [req.params.kode_siswa]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Data siswa tidak ditemukan!'
            });
        }

        res.json({ message: 'Data siswa berhasil dihapus!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Menjalankan server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
