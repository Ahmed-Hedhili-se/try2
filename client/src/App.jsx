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
        ville: ''
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
        <div className="container">
            <div className="card">
                <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                <p className="subtitle">
                    {isLogin ? 'Enter your credentials to access your account' : 'Join us today and start your journey'}
                </p>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullname"
                                placeholder="John Doe"
                                value={formData.fullname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label>Role</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="mere">Mère SOS</option>
                                <option value="tante">Tante SOS</option>
                                <option value="educatrice">Educatrice</option>
                            </select>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="form-group">
                            <label>City (Ville)</label>
                            <input
                                type="text"
                                name="ville"
                                placeholder="Paris"
                                value={formData.ville}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
                </form>

                <div className={`status-msg ${message.type}`}>
                    {message.text}
                </div>

                <div className="toggle-link">
                    {isLogin ? (
                        <>Don't have an account? <span onClick={() => setIsLogin(false)}>Sign Up</span></>
                    ) : (
                        <>Already have an account? <span onClick={() => setIsLogin(true)}>Login</span></>
                    )}
                </div>
            </div>
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
                <p>Role: <span className="badge">{user.role}</span> | City: {user.ville}</p>
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
                                    <span className="date">{new Date(r.created_at).toLocaleDateString()}</span>
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

        // Inline validation if it was already marked as invalid
        if (invalidFields.has(name)) {
            validateField(name, val);
        }
    };

    const handleBlur = (e) => {
        validateField(e.target.name, e.target.value);
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

        try {
            await axios.post(`${API_URL}/reports`, formData);
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
            <p class="subtitle">Submit a safe and secure incident report</p>

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
                        <input
                            type="text"
                            name="village"
                            className={invalidFields.has('village') ? 'invalid' : ''}
                            placeholder="Ex: Village SOS Paris"
                            value={reportData.village}
                            onChange={handleFormChange}
                            onBlur={handleBlur}
                            required
                        />
                        {invalidFields.has('village') && <div className="error-message">Please specify the village.</div>}
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
                        <input
                            type="text"
                            name="location"
                            className={invalidFields.has('location') ? 'invalid' : ''}
                            placeholder="City"
                            value={reportData.location}
                            onChange={handleFormChange}
                            onBlur={handleBlur}
                            required
                        />
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

                <button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : '🚀 Submit Report'}
                </button>
            </form>

            {msg.text && <div className={`status-msg ${msg.type}`}>{msg.text}</div>}
        </div>
    );
}

export default App;
