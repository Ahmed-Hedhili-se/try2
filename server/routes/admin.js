import express from 'express';
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
router.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { full_name, role, ville } = req.body;
    const sql = `UPDATE users SET full_name = ?, role = ?, ville = ? WHERE id_user = ?`;
    db.run(sql, [full_name, role, ville, id], function (err) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.status(200).json({ message: 'User updated successfully' });
    });
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
