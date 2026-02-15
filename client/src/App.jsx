import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function App() {
    const [isLogin, setIsLogin] = useState(true);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [view, setView] = useState('home'); // home, report, admin_temp
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        role: 'mere',
        village: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        try {
            if (isLogin) {
                const res = await axios.post(`${API_URL}/login`, {
                    email: formData.email,
                    password: formData.password
                });
                setMessage({ text: 'Login successful!', type: 'success' });
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setTimeout(() => setUser(res.data.user), 1000);
            } else {
                const res = await axios.post(`${API_URL}/signup`, formData);
                setMessage({ text: 'Sign up successful! Please log in.', type: 'success' });
                setTimeout(() => setIsLogin(true), 2000);
            }
        } catch (err) {
            let errorMsg = 'Something went wrong';
            if (!err.response) {
                errorMsg = 'Cannot reach server. Is the backend running?';
            } else {
                errorMsg = err.response.data?.message || 'Server error';
            }
            setMessage({ text: errorMsg, type: 'error' });
        }
    };

    const handleLogout = () => {
        setUser(null);
        setView('home');
        localStorage.removeItem('user');
        setFormData({ fullname: '', email: '', password: '', role: 'mere', ville: '' });
        setMessage({ text: 'Logged out successfully', type: 'success' });
    };

    if (user) {
        return (
            <div className="container">
                <nav className="navbar">
                    <div className="nav-brand">SignalSafe</div>
                    <div className="nav-links">
                        <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>Dashboard</button>
                        {!['mere', 'tante', 'educatrice', 'responsable sociale'].includes(user.role) && (
                            <button onClick={() => {
                                const session = btoa(JSON.stringify(user));
                                window.location.href = `http://localhost:5000/analyse.html?session=${session}`;
                            }}>Analyse</button>
                        )}
                        <button className={view === 'report' ? 'active' : ''} onClick={() => setView('report')}>New Signalisation</button>
                        <button className="logout-btn" onClick={handleLogout}>Logout</button>
                    </div>
                </nav>

                {view === 'home' ? (
                    <Dashboard user={user} setView={setView} />
                ) : (
                    <SignalisationForm user={user} setView={setView} />
                )}
            </div>
        );
    }

    return (
        <div className="auth-page">
            <nav className="auth-header">
                <div className="header-logo">
                    <img
                        src="https://www.sos-maroc.org/wp-content/uploads/2022/06/sos-logo-1024x352.png"
                        alt="SOS Logo"
                    />
                </div>
                <div className="header-nav">
                    <button
                        className={`nav-link ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Sign in
                    </button>
                    <button
                        className={`nav-link ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Sign up
                    </button>
                </div>
            </nav>

            <div className="shape circle-1"></div>
            <div className="shape circle-2"></div>
            <div className="shape circle-3"></div>

            <div className="auth-form-container">

                <div className="auth-header-text">
                    <h1>{isLogin ? 'Sign in' : 'Sign up'}</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Nom complet</label>
                            <input
                                type="text"
                                name="fullname"
                                className="minimalist-input"
                                placeholder="Jean Dupont"
                                value={formData.fullname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Adresse e-mail</label>
                        <input
                            type="email"
                            name="email"
                            className="minimalist-input"
                            placeholder="nom@exemple.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            className="minimalist-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label>Rôle</label>
                            <select
                                name="role"
                                className="minimalist-input"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="mere">Mère SOS</option>
                                <option value="tante">Tante SOS</option>
                                <option value="educatrice">Educatrice</option>
                                <option value="psychologues">Psychologues</option>
                                <option value="responsable sociale">Responsable sociale</option>
                                <option value="directeur">Directeur</option>
                                <option value="bureau national">Bureau national</option>
                            </select>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="form-group">
                            <label>Village SOS</label>
                            <select
                                name="village"
                                className="minimalist-input"
                                value={formData.village}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Sélectionnez un village</option>
                                <option value="Gammarth">Gammarth</option>
                                <option value="Akouda">Akouda</option>
                                <option value="Siliana">Siliana</option>
                                <option value="Mahres">Mahres</option>
                            </select>
                        </div>
                    )}

                    <button type="submit" className="sos-btn">
                        {isLogin ? 'Se connecter' : 'S\'inscrire'}
                    </button>
                </form>

                <div className={`status-msg ${message.type}`}>
                    {message.text}
                </div>

                <div className="sos-toggle-link">
                    {isLogin ? (
                        <>Vous n'avez pas de compte ? <span onClick={() => setIsLogin(false)}>S'inscrire</span></>
                    ) : (
                        <>Vous avez déjà un compte ? <span onClick={() => setIsLogin(true)}>Se connecter</span></>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

function Dashboard({ user, setView }) {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const fetchMyReports = async () => {
            try {
                const endpoint = (user.role === 'directeur' || user.role === 'bureau national' || user.role === 'psychologues')
                    ? '/reports/all'
                    : `/reports/my?userId=${user.id}`;
                const res = await axios.get(`${API_URL}${endpoint}`);
                setReports(res.data);
            } catch (err) {
                console.error('Error fetching reports', err);
            }
        };
        fetchMyReports();
    }, [user]);

    return (
        <div className="dashboard-view">
            <div className="welcome-header">
                <h1>Hello, {user.fullname}</h1>
                <p>Role: <span className="badge">{user.role}</span> | Village: {user.village}</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Reports</h3>
                    <p className="stat-value">{reports.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Actions</h3>
                    <div className="btn-group" style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn primary" onClick={() => setView('report')}>📝 New Signalisation</button>
                        {!['mere', 'tante', 'educatrice', 'responsable sociale'].includes(user.role) && (
                            <button className="btn secondary" style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.5rem 1rem', cursor: 'pointer' }} onClick={() => {
                                const session = btoa(JSON.stringify(user));
                                window.location.href = `http://localhost:5000/analyse.html?session=${session}`;
                            }}>📊 Analyse Reports</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="reports-section">
                <h2>{user.role === 'directeur' ? 'All Signalisation' : 'My Signalisation'}</h2>
                <div className="reports-list">
                    {reports.length === 0 ? (
                        <p className="empty-msg">No reports found.</p>
                    ) : (
                        reports.map(r => (
                            <div key={r.id} className="report-item">
                                <div className="report-header">
                                    <span className={`status-pill ${r.status.toLowerCase()}`}>{r.status}</span>
                                    <p>Village: {r.village}</p>
                                    <p>Submitted: {new Date(r.created_at).toLocaleDateString()}</p>
                                    {/* Delete functionality removed */}
                                </div>
                                <h4>{r.type}</h4>
                                <p className="desc">{r.description.substring(0, 100)}...</p>
                                <div className="report-meta">
                                    <span>📍 {r.location}</span>
                                    {r.urgency && <span className="urgency">Urgency: {r.urgency}</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function SignalisationForm({ user, setView }) {
    const [reportData, setReportData] = useState({
        child_name: '',
        village: '',
        abuser_name: '',
        type: '',
        location: '',
        description: '',
        urgency_level: '',
        anonymous: false
    });
    const [invalidFields, setInvalidFields] = useState(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    // Voice Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState('');

    const validateField = (name, value) => {
        const required = ['child_name', 'village', 'type', 'location', 'description', 'urgency_level'];
        if (required.includes(name)) {
            if (!value || (typeof value === 'string' && !value.trim())) {
                setInvalidFields(prev => new Set(prev).add(name));
                return false;
            } else {
                setInvalidFields(prev => {
                    const next = new Set(prev);
                    next.delete(name);
                    return next;
                });
                return true;
            }
        }
        return true;
    };

    const handleFormChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        const val = inputType === 'checkbox' ? checked : value;
        setReportData(prev => ({ ...prev, [name]: val }));

        if (invalidFields.has(name)) {
            validateField(name, val);
        }
    };

    const handleBlur = (e) => {
        validateField(e.target.name, e.target.value);
    };

    // Voice Recording Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioURL(URL.createObjectURL(blob));
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setAudioBlob(null);
            setAudioURL('');
        } catch (err) {
            console.error('Microphone access denied', err);
            alert('Veuillez autoriser l\'accès au microphone pour enregistrer un message vocal.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final validation
        let isValid = true;
        const required = ['child_name', 'village', 'type', 'location', 'description', 'urgency_level'];
        const newInvalid = new Set();
        required.forEach(field => {
            if (!reportData[field] || (typeof reportData[field] === 'string' && !reportData[field].trim())) {
                newInvalid.add(field);
                isValid = false;
            }
        });
        setInvalidFields(newInvalid);

        if (!isValid) return;

        setSubmitting(true);
        setMsg({ text: '', type: '' });

        const formData = new FormData();
        formData.append('anonymous', reportData.anonymous);
        formData.append('village', reportData.village);
        formData.append('abuser_name', reportData.abuser_name);
        formData.append('child_name', reportData.child_name);
        formData.append('type', reportData.type);
        formData.append('location', reportData.location);
        formData.append('description', reportData.description);
        formData.append('urgency', reportData.urgency_level);
        formData.append('submitterId', user.id);

        // Attach file
        const fileInput = document.getElementById('attached_file');
        if (fileInput && fileInput.files[0]) {
            formData.append('attached_file', fileInput.files[0]);
        }

        // Voice record
        if (audioBlob) {
            formData.append('audio_record', audioBlob, 'voice_record.webm');
        }

        try {
            await axios.post(`${API_URL}/reports`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMsg({ text: 'Signalisation submitted successfully!', type: 'success' });
            setTimeout(() => setView('home'), 2000);
        } catch (err) {
            setMsg({ text: 'Failed to submit report. Please try again.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="report-view card">
            <h1>SignalSafe</h1>
            <p className="subtitle">Submit a safe and secure incident report</p>

            <form onSubmit={handleSubmit} className="report-form" noValidate>
                <div className="form-group checkbox-group">
                    <label>
                        <input type="checkbox" name="anonymous" checked={reportData.anonymous} onChange={handleFormChange} />
                        <span>Report as Anonymous</span>
                    </label>
                    <div className="helper-text">Your identity will be hidden in the final report.</div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Programme (village)</label>
                        <select
                            name="village"
                            className={invalidFields.has('village') ? 'invalid' : ''}
                            value={reportData.village}
                            onChange={handleFormChange}
                            onBlur={handleBlur}
                            required
                        >
                            <option value="">Sélectionnez un village</option>
                            <option value="Gammarth">Gammarth</option>
                            <option value="Akouda">Akouda</option>
                            <option value="Siliana">Siliana</option>
                            <option value="Mahres">Mahres</option>
                        </select>
                        {invalidFields.has('village') && <div className="error-message">Please select a village.</div>}
                    </div>
                    <div className="form-group">
                        <label>Nom & prenom de l'abuseur</label>
                        <input
                            type="text"
                            name="abuser_name"
                            placeholder="Name if known"
                            value={reportData.abuser_name}
                            onChange={handleFormChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Nom & prenom de l'enfant</label>
                        <input
                            type="text"
                            name="child_name"
                            className={invalidFields.has('child_name') ? 'invalid' : ''}
                            placeholder="Full name of child"
                            value={reportData.child_name}
                            onChange={handleFormChange}
                            onBlur={handleBlur}
                            required
                        />
                        {invalidFields.has('child_name') && <div className="error-message">Child name is required.</div>}
                    </div>
                    <div className="form-group">
                        <label>Location (city/area)</label>
                        <select
                            name="location"
                            className={invalidFields.has('location') ? 'invalid' : ''}
                            value={reportData.location}
                            onChange={handleFormChange}
                            onBlur={handleBlur}
                            required
                        >
                            <option value="">Sélectionnez un village</option>
                            <option value="Gammarth">Gammarth</option>
                            <option value="Akouda">Akouda</option>
                            <option value="Siliana">Siliana</option>
                            <option value="Mahres">Mahres</option>
                        </select>
                        {invalidFields.has('location') && <div className="error-message">Location is required.</div>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Type d'incident</label>
                        <select
                            name="type"
                            className={invalidFields.has('type') ? 'invalid' : ''}
                            value={reportData.type}
                            onChange={handleFormChange}
                            onBlur={handleBlur}
                            required
                        >
                            <option value="">Select...</option>
                            <option>Santé</option>
                            <option>Comportement</option>
                            <option>Violence</option>
                            <option>Autre</option>
                        </select>
                        {invalidFields.has('type') && <div className="error-message">Please select a type.</div>}
                    </div>
                    <div className="form-group">
                        <label>Niveau d'urgence</label>
                        <select
                            name="urgency_level"
                            className={invalidFields.has('urgency_level') ? 'invalid' : ''}
                            value={reportData.urgency_level}
                            onChange={handleFormChange}
                            onBlur={handleBlur}
                            required
                        >
                            <option value="">Select...</option>
                            <option>Faible</option>
                            <option>Moyenne</option>
                            <option>Critique</option>
                        </select>
                        {invalidFields.has('urgency_level') && <div className="error-message">Urgency level required.</div>}
                    </div>
                </div>

                <div className="form-group">
                    <label>Description / Champ libre</label>
                    <textarea
                        name="description"
                        className={invalidFields.has('description') ? 'invalid' : ''}
                        placeholder="Detailed facts..."
                        value={reportData.description}
                        onChange={handleFormChange}
                        onBlur={handleBlur}
                        required
                    ></textarea>
                    {invalidFields.has('description') && <div className="error-message">Please provide a description.</div>}
                </div>

                {/* Attachments Section */}
                <div className="form-row" style={{ marginTop: '20px', borderTop: '1px solid #eff5f9', paddingTop: '20px' }}>
                    <div className="form-group">
                        <label htmlFor="attached_file">📎 Pièce jointe</label>
                        <input
                            type="file"
                            id="attached_file"
                            name="attached_file"
                            className="minimalist-input"
                            accept="image/*,video/*,.pdf,.doc,.docx"
                            style={{
                                background: 'white',
                                padding: '10px',
                                fontSize: '0.8rem'
                            }}
                        />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label>🎤 Message Vocal</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {!isRecording ? (
                                <button
                                    type="button"
                                    onClick={startRecording}
                                    style={{
                                        background: '#FEE2E2',
                                        color: '#DC2626',
                                        border: '1px solid #FCA5A5',
                                        padding: '8px 16px',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.8rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    🎤 Start Recording
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={stopRecording}
                                    style={{
                                        background: '#374151',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        animation: 'pulse 1.5s infinite'
                                    }}
                                >
                                    ⏹️ Stop
                                </button>
                            )}
                            {isRecording && (
                                <span style={{ color: '#DC2626', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    Rec...
                                </span>
                            )}
                        </div>
                        {audioURL && (
                            <audio
                                id="audio-playback"
                                src={audioURL}
                                controls
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    marginTop: '5px'
                                }}
                            />
                        )}
                    </div>
                </div>

                <style>{`
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.6; }
                        100% { opacity: 1; }
                    }
                `}</style>

                <button type="submit" disabled={submitting} style={{ marginTop: '30px' }}>
                    {submitting ? 'Submitting...' : '🚀 Submit Report'}
                </button>
            </form>

            {msg.text && <div className={`status-msg ${msg.type}`}>{msg.text}</div>}
        </div>
    );
}


function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Avez-vous des questions ?</h3>
                    <p>Appelez ou visitez-nous</p>
                    <div className="footer-phone">+(216)58 371 002</div>
                    <p>SOS Village d’Enfants Gammarth</p>
                    <p>E-mail : parrainage.enfants@sos-tunisie.org</p>
                </div>
                <div className="footer-section">
                    <h3>Newsletter</h3>
                    <p>Soyez informé(e) de nos actions et devenez acteur du changement</p>
                    <div className="newsletter-form">
                        <input type="email" placeholder="Votre adresse e-mail..." />
                        <button className="submit-btn" type="button">SOUSCRIRE</button>
                    </div>
                </div>
                <div className="footer-section">
                    <h3>Suivez-Nous sur</h3>
                    <div className="social-links">
                        <a href="https://www.facebook.com/ATVESOS" className="social-link" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </a>
                        <a href="https://instagram.com/sos_villages_tunisie?igshid=NTc4MTIwNjQ2YQ==" className="social-link" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                        </a>
                        <a href="https://www.linkedin.com/company/sos-villages-d-enfants-en-tunisie/" className="social-link" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        </a>
                        <a href="#" className="social-link">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default App;
