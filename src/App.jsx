import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function App() {
    const [isLogin, setIsLogin] = useState(true);
    const [user, setUser] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        role: 'user'
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
            const errorMsg = err.response?.data?.message || 'Something went wrong';
            setMessage({ text: errorMsg, type: 'error' });
        }
    };

    const handleLogout = () => {
        setUser(null);
        setFormData({ fullname: '', email: '', password: '', role: 'user' });
        setMessage({ text: 'Logged out successfully', type: 'success' });
    };

    // Landing page component
    if (!showAuth && !user) {
        return (
            <div className="landing-container">
                <div className="landing-left">
                    <div className="logo-section">
                        <img src="/sos-logo.PNG" alt="SOS Villages D'Enfants" className="sos-logo" />
                    </div>
                    <div className="landing-content">
                        <h3>Lorem ipsum dolor sit amet.</h3>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh 
                            euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
                        </p>
                    </div>
                </div>
                <div className="landing-right">
                    <div className="login-section">
                        <h3>Log In</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setShowAuth(true);
                        }}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    placeholder="johnsmith@gmail.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="form-links">
                                <span>Forgot Password?</span>
                                <span onClick={() => { setShowAuth(true); setIsLogin(false); }} style={{ cursor: 'pointer' }}>Not a Member yet?</span>
                            </div>
                            <button type="submit">SIGN IN</button>
                        </form>
                        <p className="or-text">or with</p>
                        <div className="social-icons">
                            <span>f</span>
                            <span>𝕏</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (user) {
        return (
            <div className="container">
                <div className="card home-card">
                    <h1>Welcome Home</h1>
                    <p className="subtitle">You are successfully logged in</p>
                    <div className="user-info">
                        <p><strong>Full Name:</strong> {user.fullname}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                    </div>
                    <button onClick={() => {
                        handleLogout();
                        setShowAuth(false);
                    }}>Logout</button>
                </div>
            </div>
        );
    }

    // Auth page (login/signup)
    return (
        <div className="container">
            <div className="card">
                <button className="back-button" onClick={() => setShowAuth(false)}>← Back</button>
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
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                            </select>
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

export default App;
