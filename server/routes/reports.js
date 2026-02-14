import express from 'express';
import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import db from '../database.js';

const router = express.Router();

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images and audio files are allowed!'), false);
        }
    }
});

// Submit Signalisation
router.post('/reports', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), (req, res) => {
    const { anonymous, village, abuser_name, child_name, childAge, relationship, location, type, description, urgency, submitterId } = req.body;
    const report_id = nanoid(12);
    const created_at = new Date().toISOString();
    const isAnonymous = anonymous === 'true' || anonymous === true ? 1 : 0;

    const photo = req.files['photo'] ? req.files['photo'][0] : null;
    const audio = req.files['audio'] ? req.files['audio'][0] : null;

    const sql = `INSERT INTO signalisation (
        report_id, created_at, anonymous, submitter_id, 
        village, abuser_name, child_name,
        child_age, relationship, location, type, description, urgency,
        photo_filename, photo_mimetype, photo_size,
        audio_filename, audio_mimetype, audio_size
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        report_id, created_at, isAnonymous, submitterId,
        village, abuser_name, child_name,
        childAge, relationship, location, type, description, urgency,
        photo?.filename, photo?.mimetype, photo?.size,
        audio?.filename, audio?.mimetype, audio?.size
    ];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.status(201).json({ message: 'Report submitted successfully', reportId: report_id, id: this.lastID });
    });
});

// GET reports for current user
router.get('/reports/my', (req, res) => {
    const { userId } = req.query;
    const sql = `SELECT * FROM signalisation WHERE submitter_id = ? ORDER BY created_at DESC`;
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json(rows);
    });
});

// GET all reports (for psychologues/directeur)
router.get('/reports/all', (req, res) => {
    const sql = `SELECT * FROM signalisation ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json(rows);
    });
});

// GET all signalisations (for Analyse feature) - Protected by RBAC
router.get('/signalisations', (req, res) => {
    const userRole = req.headers['x-user-role'];
    const forbiddenRoles = ['mere', 'tante', 'educatrice', 'responsable sociale'];

    if (forbiddenRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const sql = `SELECT * FROM signalisation ORDER BY id DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json(rows);
    });
});

export default router;
