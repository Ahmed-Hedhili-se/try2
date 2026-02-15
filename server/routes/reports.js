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
        if (file.mimetype.startsWith('image/') ||
            file.mimetype.startsWith('audio/') ||
            file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only images, audio, and PDF files are allowed!'), false);
        }
    }
});

const reportUploadFields = upload.fields([
    { name: 'file_fiche_initial', maxCount: 1 },
    { name: 'file_evaluation', maxCount: 1 },
    { name: 'file_plan_action', maxCount: 1 },
    { name: 'file_rapport_suivi', maxCount: 1 },
    { name: 'file_rapport_final', maxCount: 1 },
    { name: 'file_avis_cloture', maxCount: 1 }
]);

const ALLOWED_VILLAGES = ['Gammarth', 'Akouda', 'Siliana', 'Mahres'];

// Submit Signalisation
router.post('/reports', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), (req, res) => {
    const { anonymous, village, abuser_name, child_name, childAge, relationship, location, type, description, urgency, submitterId } = req.body;

    if (village && !ALLOWED_VILLAGES.includes(village)) {
        return res.status(400).json({ message: 'Village invalide' });
    }

    if (location && !ALLOWED_VILLAGES.includes(location)) {
        return res.status(400).json({ message: 'Location invalide' });
    }

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
    const userId = req.query.userId;
    const forbiddenRoles = ['mere', 'tante', 'educatrice', 'responsable sociale'];

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: userId missing' });
    }

    if (forbiddenRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Step A: Get User Role and Village
    const userSql = `SELECT role, village FROM users WHERE id_user = ?`;
    db.get(userSql, [userId], (err, user) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!user) return res.status(404).json({ message: 'User not found' });

        let sql;
        let params = [];

        // Step B: Filter Signalisations based on role
        if (user.role === 'psychologues' || user.role === 'directeur') {
            sql = `SELECT * FROM signalisation WHERE village = ? ORDER BY id DESC`;
            params = [user.village];
        } else if (user.role === 'bureau national') {
            sql = `SELECT * FROM signalisation ORDER BY id DESC`;
        } else {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        db.all(sql, params, (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(200).json(rows);
        });
    });
});

// UPDATE signalisation status - Protected by RBAC (Psychologues only)
router.put('/signalisations/:id/status', (req, res) => {
    const userRole = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    const { status, psychologue } = req.body;

    if (userRole !== 'psychologues') {
        return res.status(403).json({ message: 'Accès non autorisé' });
    }

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    const sql = `UPDATE signalisation SET status = ?, psychologue = ?, psychologue_id = ? WHERE id = ?`;
    db.run(sql, [status, psychologue, userId, id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json({ message: 'Status updated successfully' });
    });
});

// DELETE signalisation - Protected by RBAC (Admin only)
router.delete('/reports/:id', (req, res) => {
    const userRole = req.headers['x-user-role'];
    const { id } = req.params;

    if (userRole !== 'directeur' && userRole !== 'bureau national') {
        return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const sql = `DELETE FROM signalisation WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json({ message: 'Report deleted successfully' });
    });
});

// POST Multiple Rapport Documents for a specific Signalisation
router.post('/signalisations/:id/rapports', reportUploadFields, (req, res) => {
    const { id } = req.params;
    const userRole = req.headers['x-user-role'];

    // RBAC: Only psychologues, directeur, or bureau national
    const allowedRoles = ['psychologues', 'directeur', 'bureau national'];
    if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const files = req.files;
    if (!files || Object.keys(files).length === 0) {
        return res.status(400).json({ message: 'No documents uploaded' });
    }

    const updateFields = [];
    const params = [];

    const possibleFields = [
        'file_fiche_initial',
        'file_evaluation',
        'file_plan_action',
        'file_rapport_suivi',
        'file_rapport_final',
        'file_avis_cloture'
    ];

    possibleFields.forEach(field => {
        if (files[field]) {
            updateFields.push(`${field} = ?`);
            params.push(files[field][0].filename);
        }
    });

    if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No valid document fields provided' });
    }

    params.push(id);
    const sql = `UPDATE signalisation SET ${updateFields.join(', ')} WHERE id = ?`;

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json({ message: 'Documents uploaded successfully' });
    });
});

// GET Single Signalisation - Protected by strict RBAC/Ownership
router.get('/signalisations/:id', (req, res) => {
    const userRole = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // 1. Get User Village
    const userSql = `SELECT role, village FROM users WHERE id_user = ?`;
    db.get(userSql, [userId], (err, user) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 2. Get Signalisation
        const reportSql = `SELECT * FROM signalisation WHERE id = ?`;
        db.get(reportSql, [id], (err, report) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!report) return res.status(404).json({ message: 'Report not found' });

            // 3. Security Check (IDOR Prevention)
            if (user.role === 'directeur') {
                if (report.village !== user.village) {
                    return res.status(403).json({ message: 'Accès non autorisé: Hors de votre village' });
                }
            } else if (user.role === 'psychologues') {
                if (report.village !== user.village) {
                    return res.status(403).json({ message: 'Accès non autorisé: Hors de votre village' });
                }
            } else if (user.role !== 'bureau national') {
                return res.status(403).json({ message: 'Accès non autorisé' });
            }

            res.status(200).json(report);
        });
    });
});

// GET Global View for signalisations (Admin/Level 3 Governance)
router.get('/global/signalisations', (req, res) => {
    const userRole = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];

    if (userRole !== 'directeur' && userRole !== 'bureau national') {
        return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const userSql = `SELECT village FROM users WHERE id_user = ?`;
    db.get(userSql, [userId], (err, user) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!user) return res.status(404).json({ message: 'User not found' });

        let sql = `
            SELECT s.*, u.full_name AS psychologue_nom 
            FROM signalisation s 
            LEFT JOIN users u ON s.psychologue_id = u.id_user
        `;
        let params = [];

        if (userRole === 'directeur') {
            sql += ` WHERE s.village = ?`;
            params.push(user.village);
        }

        sql += ` ORDER BY s.id DESC`;

        db.all(sql, params, (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            // Wrap in an object to provide metadata (like village for title)
            res.status(200).json({
                reports: rows,
                village: userRole === 'directeur' ? user.village : 'National',
                role: userRole
            });
        });
    });
});

export default router;
