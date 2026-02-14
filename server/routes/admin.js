import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';

const router = express.Router();

// GET all users
router.get('/users', (req, res) => {
    const sql = `SELECT id_user as id, full_name, mail, role, ville, is_approved FROM users`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.status(200).json(rows);
    });
});

// Create new user (Admin)
router.post('/users', async (req, res) => {
    const { full_name, mail, password, role, ville } = req.body;
    if (!full_name || !mail || !password || !role || !ville) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (full_name, mail, password, role, ville, is_approved) VALUES (?, ?, ?, ?, ?, 1)`;
        db.run(sql, [full_name, mail, hashedPassword, role, ville], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ message: 'User already exists' });
                }
                return res.status(500).json({ message: err.message });
            }
            res.status(201).json({ message: 'User created successfully', userId: this.lastID });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Approve a user
router.put('/users/:id/approve', (req, res) => {
    const { id } = req.params;
    const sql = `UPDATE users SET is_approved = 1 WHERE id_user = ?`;
    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.status(200).json({ message: 'User approved successfully' });
    });
});

// Update user details
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { full_name, role, ville, password } = req.body;

    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const sql = `UPDATE users SET full_name = ?, role = ?, ville = ?, password = ? WHERE id_user = ?`;
            db.run(sql, [full_name, role, ville, hashedPassword, id], function (err) {
                if (err) return res.status(500).json({ message: err.message });
                res.status(200).json({ message: 'User updated successfully with new password' });
            });
        } else {
            const sql = `UPDATE users SET full_name = ?, role = ?, ville = ? WHERE id_user = ?`;
            db.run(sql, [full_name, role, ville, id], function (err) {
                if (err) return res.status(500).json({ message: err.message });
                res.status(200).json({ message: 'User updated successfully' });
            });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a user
router.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM users WHERE id_user = ?`;
    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    });
});

export default router;
