import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../components/authService';
import AuthFormContainer from '../components/AuthFormContainer';
import formStyles from '../components/Form.module.css';

const SignUpPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isSignedUp, setIsSignedUp] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        
        try {
            console.log('Attempting signup with:', { name, email, password: '***' });
            const response = await authService.signup(name, email, password);
            console.log('Signup response:', response);
            
            // Store user credentials associated with their email
            const userCredentials = {
                name: name,
                email: email
            };
            localStorage.setItem(`user_credentials_${email}`, JSON.stringify(userCredentials));
            
            setMessage(response.data || 'Account created! Please check your email for verification code.');
            setIsSignedUp(true);
        } catch (error: any) {
            console.error('Signup error:', error);
            
            if (error.code === 'ERR_NETWORK') {
                setMessage('Network error. Please check if the server is running on http://localhost:8081');
            } else if (error.response) {
                setMessage(error.response?.data?.message || `Signup failed: ${error.response.status}`);
            } else {
                setMessage('Signup failed: ' + error.message);
            }
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        
        try {
            console.log('Attempting OTP verification with:', { email, otp });
            const response = await authService.verifyOtp(email, otp);
            console.log('OTP verification response:', response);
            
            setMessage("Success! Email verified. Redirecting to sign in...");
            setTimeout(() => navigate('/signin'), 2000);
        } catch (error: any) {
            console.error('OTP verification error:', error);
            
            if (error.code === 'ERR_NETWORK') {
                setMessage('Network error. Please check if the server is running on http://localhost:8081');
            } else if (error.response) {
                setMessage(error.response?.data?.message || `OTP verification failed: ${error.response.status}`);
            } else {
                setMessage('OTP verification failed: ' + error.message);
            }
        }
    };

    return (
        <AuthFormContainer title={!isSignedUp ? "Create your account" : "Verify Your Email"}>
            {!isSignedUp ? (
                <form onSubmit={handleSignUp}>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Name</label>
                        <input 
                            className={formStyles.input} 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Email</label>
                        <input 
                            className={formStyles.input} 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Password</label>
                        <input 
                            className={formStyles.input} 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button className={formStyles.button} type="submit">Sign Up</button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp}>
                    <p style={{ textAlign: 'center', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                        We've sent a verification code to <strong>{email}</strong>. Please enter it below.
                    </p>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Verification Code</label>
                        <input 
                            className={formStyles.input} 
                            type="text" 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            required 
                        />
                    </div>
                    <button className={formStyles.button} type="submit">Verify Email</button>
                </form>
            )}
            {message && <p className={formStyles.message}>{message}</p>}
        </AuthFormContainer>
    );
};

export default SignUpPage;