import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db from './database.js';
import adminRoutes from './routes/admin.js';
import reportsRoutes from './routes/reports.js';
import open from 'open';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}

app.use('/api/admin', adminRoutes);
app.use('/api', reportsRoutes);

const PORT = 5000;

const ALLOWED_VILLAGES = ['Gammarth', 'Akouda', 'Siliana', 'Mahres'];

// Sign Up Endpoint
app.post('/api/signup', async (req, res) => {
    const { fullname, email, password, role, village } = req.body;

    if (!fullname || !email || !password || !role || !village) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!ALLOWED_VILLAGES.includes(village)) {
        return res.status(400).json({ message: 'Village invalide' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Automated permission calculation based on role
        let signalisation_psy = 0;
        let signalisation_other = 0;
        let see_all = 0;

        if (role === 'psychologues' || role === 'responsable sociale') {
            signalisation_psy = 1;
        } else if (['mere', 'tante', 'educatrice'].includes(role)) {
            signalisation_other = 1;
        } else if (['directeur', 'bureau national'].includes(role)) {
            see_all = 1;
        }

        const sql = `INSERT INTO users (full_name, mail, password, role, village, signalisation_psy, signalisation_other, see_all, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(sql, [fullname, email, hashedPassword, role, village, signalisation_psy, signalisation_other, see_all, 0], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ message: 'User already exists' });
                }
                return res.status(500).json({ message: err.message });
            }
            res.status(201).json({ message: 'User created successfully', userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const sql = `SELECT * FROM users WHERE mail = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!user) {
            return res.status(404).json({ message: 'the user not exist' });
        }

        if (user.is_approved === 0) {
            return res.status(403).json({ message: 'Account pending administrator approval' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id_user,
                fullname: user.full_name,
                email: user.mail,
                role: user.role,
                village: user.village,
                signalisation_psy: user.signalisation_psy,
                signalisation_other: user.signalisation_other,
                see_all: user.see_all,
                is_approved: user.is_approved
            }
        });
    });
});

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
        await open(`http://localhost:${PORT}/admin.html`);
    } catch (err) {
        console.error('Failed to open browser:', err);
    }
});
