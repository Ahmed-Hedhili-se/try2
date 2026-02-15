const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create Signalisation
app.post('/api/signalisations', (req, res) => {
    const {
        is_anonymous,
        village,
        abuser_name,
        child_name,
        incident_type,
        urgency_level,
        description
    } = req.body;

    const sql = `INSERT INTO signalisations (
        is_anonymous, village, abuser_name, child_name, 
        incident_type, urgency_level, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        is_anonymous ? 1 : 0,
        village,
        abuser_name,
        child_name,
        incident_type,
        urgency_level,
        description
    ];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.status(201).json({
            message: 'Signalisation created successfully',
            id: this.lastID
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
