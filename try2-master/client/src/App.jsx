import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function App() {
    const [isLogin, setIsLogin] = useState(true);
    const [user, setUser] = useState(null);
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
                    <button className="btn primary" onClick={() => setView('report')}>📝 New Signalisation</button>
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
        childAge: '',
        relationship: '',
        type: '',
        location: '',
        description: '',
        anonymous: false
    });
    const [photo, setPhoto] = useState(null);
    const [audio, setAudio] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const handleFormChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setReportData({ ...reportData, [e.target.name]: value });
    };

    const handleFileChange = (e) => {
        if (e.target.name === 'photo') setPhoto(e.target.files[0]);
        if (e.target.name === 'audio') setAudio(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMsg({ text: '', type: '' });

        const formData = new FormData();
        Object.keys(reportData).forEach(key => formData.append(key, reportData[key]));
        formData.append('submitterId', user.id);
        if (photo) formData.append('photo', photo);
        if (audio) formData.append('audio', audio);

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
            <h1>Submit Signalisation</h1>
            <p className="subtitle">Help us protect children by reporting your concerns.</p>

            <form onSubmit={handleSubmit} className="report-form">
                <div className="form-group checkbox-group">
                    <label>
                        <input type="checkbox" name="anonymous" checked={reportData.anonymous} onChange={handleFormChange} />
                        <span>Anonymous (hide identity in the report)</span>
                    </label>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Child age (approx.)</label>
                        <input type="text" name="childAge" placeholder="e.g., 8" value={reportData.childAge} onChange={handleFormChange} />
                    </div>
                    <div className="form-group">
                        <label>Relationship to child</label>
                        <input type="text" name="relationship" placeholder="e.g., employee" value={reportData.relationship} onChange={handleFormChange} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Type of concern</label>
                        <select name="type" value={reportData.type} onChange={handleFormChange} required>
                            <option value="">Select...</option>
                            <option>Physical violence</option>
                            <option>Psychological/emotional abuse</option>
                            <option>Sexual abuse</option>
                            <option>Neglect</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Location (city/area)</label>
                        <input type="text" name="location" placeholder="City" value={reportData.location} onChange={handleFormChange} required />
                    </div>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" placeholder="Write facts you know..." value={reportData.description} onChange={handleFormChange} required></textarea>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Attach Picture</label>
                        <input type="file" name="photo" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div className="form-group">
                        <label>Voice Message (Upload)</label>
                        <input type="file" name="audio" accept="audio/*" onChange={handleFileChange} />
                    </div>
                </div>

                <button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : '✅ Submit Report'}
                </button>
            </form>

            {msg.text && <div className={`status-msg ${msg.type}`}>{msg.text}</div>}
        </div>
    );
}

export default App;
