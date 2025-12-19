import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../components/authService';
import AuthFormContainer from '../components/AuthFormContainer';
import formStyles from '../components/Form.module.css';

const SignInPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forceAdminRole, setForceAdminRole] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        
        try {
            console.log('🔐 Attempting signin with:', { email, password: '***' });
            console.log('📡 Backend URL:', 'http://localhost:8081/api/auth/signin');
            console.log('🌐 Frontend URL:', window.location.origin);
            
            const response = await authService.signin(email, password);
            console.log('✅ Signin successful! Response:', response.data);
            
            if (response.data.token) {
                // Clear previous user's data from localStorage
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                
                // Store new user's data - backend should include name, email, and role
                const userData = {
                    token: response.data.token,
                    email: response.data.email || email, // Use email from response or login form
                    name: response.data.name || null,    // Name from backend (if provided)
                    role: forceAdminRole ? 'ADMIN' : (response.data.role || 'USER')   // Use forced role or backend role
                };
                
                localStorage.setItem('user', JSON.stringify(userData));
                
                // If backend doesn't provide name, try to get from stored credentials
                if (!response.data.name) {
                    const credentials = localStorage.getItem(`user_credentials_${email}`);
                    if (credentials) {
                        const parsed = JSON.parse(credentials);
                        userData.name = parsed.name;
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                }
                
                // Dispatch custom event to notify navbar of auth state change
                window.dispatchEvent(new Event('authStateChanged'));
                
                setMessage('✅ Login successful! Redirecting...');
                setTimeout(() => navigate('/'), 1000);
            } else {
                setMessage('❌ Login failed: No token received');
            }
        } catch (error: any) {
            console.error('❌ Signin error:', error);
            console.error('📋 Error details:', {
                code: error.code,
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.code === 'ERR_NETWORK') {
                setMessage('🌐 Network error. CORS issue detected. Your backend needs CORS configuration for ' + window.location.origin);
            } else if (error.response?.status === 403) {
                setMessage('🔒 Access forbidden (403). CORS not configured properly in backend. Check Eclipse WebConfig.java');
            } else if (error.response?.status === 401) {
                setMessage('❌ Invalid email or password');
            } else if (error.response) {
                setMessage(error.response?.data?.message || `❌ Login failed: ${error.response.status}`);
            } else {
                setMessage('❌ Login failed: ' + error.message);
            }
        }
    };

    return (
        <AuthFormContainer title="Welcome Back">
            <form onSubmit={handleSignIn}>
                <div className={formStyles.formGroup}>
                    <label className={formStyles.label}>Email</label>
                    <input className={formStyles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className={formStyles.formGroup}>
                    <label className={formStyles.label}>Password</label>
                    <input className={formStyles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                
                {/* Admin Login Toggle - For Testing Only */}
                <div className={formStyles.formGroup} style={{ marginTop: '1rem' }}>
                    <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.8)'
                    }}>
                        <input 
                            type="checkbox" 
                            checked={forceAdminRole}
                            onChange={(e) => setForceAdminRole(e.target.checked)}
                            style={{ 
                                marginRight: '0.5rem',
                                cursor: 'pointer',
                                width: '18px',
                                height: '18px'
                            }}
                        />
                        <span>Login as Admin (for testing)</span>
                    </label>
                    {forceAdminRole && (
                        <p style={{ 
                            fontSize: '0.75rem', 
                            color: '#FFBB28', 
                            marginTop: '0.5rem',
                            marginBottom: 0,
                            fontStyle: 'italic'
                        }}>
                            ⚠️ This will override your role to ADMIN in frontend only
                        </p>
                    )}
                </div>
                
                <button className={formStyles.button} type="submit">Sign In</button>
            </form>
            <Link className={formStyles.link} to="/forgot-password">Forgot Password?</Link>
            {message && <p className={formStyles.message}>{message}</p>}
        </AuthFormContainer>
    );
};

export default SignInPage;