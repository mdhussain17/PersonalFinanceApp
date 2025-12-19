import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../components/authService';
import AuthFormContainer from '../components/AuthFormContainer';
import formStyles from '../components/Form.module.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authService.forgotPassword(email);
            setMessage('An OTP has been sent to your email.');
            setStep(2);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Failed to send OTP.');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authService.resetPassword(email, otp, newPassword);
            setMessage('Password has been reset successfully! Redirecting...');
            setTimeout(() => navigate('/signin'), 2000);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Failed to reset password.');
        }
    };

    return (
        <AuthFormContainer title={step === 1 ? "Forgot Password" : "Reset Your Password"}>
            {step === 1 ? (
                <form onSubmit={handleRequestOtp}>
                    <p style={{ textAlign: 'center', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                        Enter your email to receive a password reset OTP.
                    </p>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Email</label>
                        <input className={formStyles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <button className={formStyles.button} type="submit">Send OTP</button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword}>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>OTP from Email</label>
                        <input className={formStyles.input} type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>New Password</label>
                        <input className={formStyles.input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <button className={formStyles.button} type="submit">Reset Password</button>
                </form>
            )}
            {message && <p className={formStyles.message}>{message}</p>}
        </AuthFormContainer>
    );
};

export default ForgotPasswordPage;