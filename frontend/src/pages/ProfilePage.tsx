import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getUserName, getUserEmail } from '../utils/auth';
import profileService from '../services/profileService';
import transactionService from '../services/transactionService';
import styles from './ProfilePage.module.css';

interface ProfileData {
    name: string;
    email: string;
    monthlyIncome: number;
    savingsGoal: number;
    targetExpenses: number;
}

interface TransactionSummary {
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    availableBalance: number;
}

const ProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    
    const [profileData, setProfileData] = useState<ProfileData>({
        name: '',
        email: '',
        monthlyIncome: 0,
        savingsGoal: 0,
        targetExpenses: 0
    });

    // Transaction summary data (live data from transactions)
    const [transactionSummary, setTransactionSummary] = useState<TransactionSummary>({
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        availableBalance: 0
    });

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/signin');
            return;
        }
        loadProfile();
        loadTransactionSummary();
    }, [navigate]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            // Get user data from localStorage (saved during login)
            const userName = getUserName();
            const userEmail = getUserEmail();
            
            // Try to load financial data from backend first
            try {
                const response = await profileService.getProfile();
                if (response.data) {
                    setProfileData({
                        name: userName,
                        email: userEmail,
                        monthlyIncome: parseFloat(response.data.monthlyIncome) || 0,
                        savingsGoal: parseFloat(response.data.savingsGoal) || 0,
                        targetExpenses: parseFloat(response.data.targetExpenses) || 0
                    });
                }
            } catch (apiError: any) {
                // If backend doesn't have data (404) or other error, initialize with zeros
                console.log('No profile data in backend yet, initializing with zeros');
                setProfileData({
                    name: userName,
                    email: userEmail,
                    monthlyIncome: 0,
                    savingsGoal: 0,
                    targetExpenses: 0
                });
            }
            
            setLoading(false);
        } catch (err) {
            setError('Failed to load profile');
            setLoading(false);
        }
    };

    const loadTransactionSummary = async () => {
        try {
            const response = await transactionService.getTransactionSummary();
            const { totalIncome, totalExpenses, totalSavings } = response.data;
            
            setTransactionSummary({
                totalIncome: totalIncome || 0,
                totalExpenses: totalExpenses || 0,
                totalSavings: totalSavings || 0,
                availableBalance: 0 // Calculated on render
            });
        } catch (err) {
            console.log('Failed to load transaction summary:', err);
            // Keep defaults if error
        }
    };

    // Calculate balance (same formula as TransactionsPage)
    const calculateBalance = () => {
        // Balance = (Target Budget + Extra Income) - (Expenses + Savings)
        return (profileData.targetExpenses + transactionSummary.totalIncome) - 
               (transactionSummary.totalExpenses + transactionSummary.totalSavings);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = name === 'name' || name === 'email' ? value : parseFloat(value) || 0;
        
        setProfileData(prev => {
            const updated = {
                ...prev,
                [name]: numericValue
            };
            
            // Auto-calculate Target Expenses when Monthly Income or Savings Goal changes
            if (name === 'monthlyIncome' || name === 'savingsGoal') {
                const income = name === 'monthlyIncome' ? numericValue as number : prev.monthlyIncome;
                const savings = name === 'savingsGoal' ? numericValue as number : prev.savingsGoal;
                updated.targetExpenses = Math.max(0, income - savings);
            }
            
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Prepare data to send to backend
            const dataToSave = {
                name: profileData.name,
                email: profileData.email,
                monthlyIncome: profileData.monthlyIncome,
                savingsGoal: profileData.savingsGoal,
                targetExpenses: profileData.targetExpenses
            };

            // Try to update first, if it fails (404), create new profile
            try {
                await profileService.updateProfile(dataToSave);
                setSuccess('Profile updated successfully!');
            } catch (updateError: any) {
                if (updateError.response?.status === 404) {
                    // Profile doesn't exist, create it
                    await profileService.createProfile(dataToSave);
                    setSuccess('Profile created successfully!');
                } else {
                    throw updateError;
                }
            }
            
            setIsEditing(false);
            setLoading(false);
        } catch (err: any) {
            console.error('Profile save error:', err);
            console.error('Error details:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });
            
            if (err.code === 'ERR_NETWORK') {
                setError('Cannot connect to backend. Please check if server is running.');
            } else if (err.response?.status === 403) {
                setError('Authentication failed. Please sign in again.');
            } else {
                setError(err.response?.data?.message || err.message || 'Failed to update profile');
            }
            setLoading(false);
        }
    };

    const getPercentage = (value: number) => {
        if (profileData.monthlyIncome === 0) return 0;
        return ((value / profileData.monthlyIncome) * 100).toFixed(1);
    };

    if (loading && !isEditing) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading profile...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.profileContainer}>
                <div className={styles.header}>
                    <h1>My Profile</h1>
                    {!isEditing && (
                        <button 
                            className={styles.editButton}
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.section}>
                        <h2>Personal Information</h2>
                        <div className={styles.formGroup}>
                            <label>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profileData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleInputChange}
                                disabled={true}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>Financial Information</h2>
                        <div className={styles.formGroup}>
                            <label>Monthly Income (₹)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                name="monthlyIncome"
                                value={profileData.monthlyIncome}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                required
                            />
                            {!isEditing && (
                                <span className={styles.info}>100%</span>
                            )}
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label>Monthly Savings Goal (₹)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                name="savingsGoal"
                                value={profileData.savingsGoal}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                required
                            />
                            {!isEditing && profileData.monthlyIncome > 0 && (
                                <span className={styles.info}>
                                    {getPercentage(profileData.savingsGoal)}% of income
                                </span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Target Monthly Expenses (₹)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                name="targetExpenses"
                                value={profileData.targetExpenses}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                required
                            />
                            {!isEditing && profileData.monthlyIncome > 0 && (
                                <span className={styles.info}>
                                    {getPercentage(profileData.targetExpenses)}% of income
                                </span>
                            )}
                        </div>
                    </div>

                    {!isEditing && (
                        <div className={styles.summary}>
                            <h2>Financial Summary</h2>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryItem}>
                                    <span className={styles.label}>Monthly Income:</span>
                                    <span className={styles.value}>₹{profileData.monthlyIncome.toFixed(2)}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.label}>Target Expenses:</span>
                                    <span className={styles.value}>₹{profileData.targetExpenses.toFixed(2)}</span>
                                </div>
                            </div>

                            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#00D9FF' }}>Live Transaction Data</h3>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryItem}>
                                    <span className={styles.label}>💰 Total Savings:</span>
                                    <span className={styles.value} style={{ color: '#00C49F' }}>₹{transactionSummary.totalSavings.toFixed(2)}</span>
                                </div>
                                <div className={`${styles.summaryItem} ${styles.remaining}`}>
                                    <span className={styles.label}>💵 Remaining Balance:</span>
                                    <span className={`${styles.value} ${calculateBalance() < 0 ? styles.negative : styles.positive}`}>
                                        ₹{calculateBalance().toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                * Savings and Balance update in real-time from your transactions
                            </div>
                            {calculateBalance() < 0 && (
                                <div className={styles.warning}>
                                    ⚠️ Your spending and savings exceed your income!
                                </div>
                            )}
                        </div>
                    )}

                    {isEditing && (
                        <div className={styles.buttonGroup}>
                            <button 
                                type="submit" 
                                className={styles.saveButton}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                type="button" 
                                className={styles.cancelButton}
                                onClick={() => {
                                    setIsEditing(false);
                                    loadProfile();
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
