import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '../utils/auth';
import transactionService from '../services/transactionService';
import styles from './DashboardPage.module.css';

interface SpendingData {
    category: string;
    totalAmount: number;
}

const DashboardPage = () => {
    const navigate = useNavigate();
    const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Export Date Filter State
    const [exportStartDate, setExportStartDate] = useState<string>(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    });
    const [exportEndDate, setExportEndDate] = useState<string>(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    });

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/signin');
            return;
        }
        loadSpendingData();
    }, [navigate]);

    const loadSpendingData = async () => {
        try {
            const response = await transactionService.getSpendingByCategory();
            setSpendingData(response.data);
        } catch (error) {
            console.error('Error fetching spending data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (path: string) => {
        navigate(path);
    };

    const handleExportCSV = () => {
        const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).token : '';
        const url = `http://localhost:8081/api/export/csv?startDate=${exportStartDate}&endDate=${exportEndDate}`;
        
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `transactions_${exportStartDate}_to_${exportEndDate}.csv`);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        })
        .catch(err => {
            console.error('Export failed:', err);
            setError('Failed to export CSV');
        });
    };

    const handleExportPDF = () => {
        const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).token : '';
        const url = `http://localhost:8081/api/export/pdf?startDate=${exportStartDate}&endDate=${exportEndDate}`;
        
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `financial_report_${exportStartDate}_to_${exportEndDate}.pdf`);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        })
        .catch(err => {
            console.error('Export failed:', err);
            setError('Failed to export PDF');
        });
    };

    const setExportPreset = (preset: string) => {
        const now = new Date();
        let start: Date;
        let end: Date = now;

        switch (preset) {
            case 'last30':
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'lastMonth':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'allTime':
                start = new Date(2020, 0, 1);
                break;
            default:
                return;
        }

        setExportStartDate(start.toISOString().split('T')[0]);
        setExportEndDate(end.toISOString().split('T')[0]);
    };

    return (
        <div className={styles.container}>
            <div className={styles.dashboardContainer}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Financial Dashboard</h1>
                    <p className={styles.subtitle}>Manage your finances effectively</p>
                </div>

                {/* Dashboard Cards Grid */}
                <div className={styles.cardsGrid}>
                    {/* Transactions Card */}
                    <div 
                        className={`${styles.card} ${styles.activeCard}`}
                        onClick={() => handleCardClick('/transactions')}
                    >
                        <div className={styles.cardIcon}>💰</div>
                        <h3 className={styles.cardTitle}>Transactions</h3>
                        <p className={styles.cardDescription}>
                            Track your income and expenses
                        </p>
                        <div className={styles.cardBadge}>Active</div>
                    </div>

                    {/* Profile Card */}
                    <div 
                        className={`${styles.card} ${styles.activeCard}`}
                        onClick={() => handleCardClick('/profile')}
                    >
                        <div className={styles.cardIcon}>👤</div>
                        <h3 className={styles.cardTitle}>Profile</h3>
                        <p className={styles.cardDescription}>
                            Manage your profile and financial goals
                        </p>
                        <div className={styles.cardBadge}>Active</div>
                    </div>

                    {/* Budget Card - Now Active! */}
                    <div 
                        className={`${styles.card} ${styles.active}`}
                        onClick={() => handleCardClick('/budget')}
                    >
                        <div className={styles.cardIcon}>💼</div>
                        <h3 className={styles.cardTitle}>Budget Planning</h3>
                        <p className={styles.cardDescription}>
                            Plan and manage your monthly budget
                        </p>
                        <div className={styles.cardBadge}>Active</div>
                    </div>

                    {/* Reports Card - Now Active! */}
                    <div 
                        className={`${styles.card} ${styles.activeCard}`}
                        onClick={() => handleCardClick('/reports')}
                    >
                        <div className={styles.cardIcon}>📊</div>
                        <h3 className={styles.cardTitle}>Reports & Analytics</h3>
                        <p className={styles.cardDescription}>
                            View insights and financial reports
                        </p>
                        <div className={styles.cardBadge}>Active</div>
                    </div>

                    {/* Goals Card - Now Active! */}
                    <div 
                        className={`${styles.card} ${styles.activeCard}`}
                        onClick={() => handleCardClick('/savings-goals')}
                    >
                        <div className={styles.cardIcon}>🎯</div>
                        <h3 className={styles.cardTitle}>Savings Goals</h3>
                        <p className={styles.cardDescription}>
                            Set and track your savings goals
                        </p>
                        <div className={styles.cardBadge}>Active</div>
                    </div>

                    {/* Settings Card - Coming Soon */}
                    <div className={`${styles.card} ${styles.comingSoonCard}`}>
                        <div className={styles.cardIcon}>⚙️</div>
                        <h3 className={styles.cardTitle}>Settings</h3>
                        <p className={styles.cardDescription}>
                            Configure app preferences
                        </p>
                        <div className={styles.comingSoonBadge}>Coming Soon</div>
                    </div>
                </div>

                {/* Export Data Section */}
                <div className={styles.quickStats}>
                    <h2 className={styles.statsTitle}>📥 Export Data</h2>
                    <p className={styles.statsDescription}>
                        Download your transaction data for external analysis
                    </p>
                    
                    {error && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255, 77, 77, 0.1)',
                            border: '1px solid rgba(255, 77, 77, 0.3)',
                            borderRadius: '8px',
                            color: '#FF4D4D',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '15px',
                        padding: '2rem',
                        border: '1px solid rgba(137, 250, 255, 0.2)',
                        marginTop: '1.5rem'
                    }}>
                        {/* Date Range Selection */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div>
                                <label style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={exportStartDate}
                                    onChange={(e) => setExportStartDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(137, 250, 255, 0.2)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={exportEndDate}
                                    onChange={(e) => setExportEndDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(137, 250, 255, 0.2)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Quick Presets */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                                Quick Presets:
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setExportPreset('last30')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'rgba(0, 196, 159, 0.2)',
                                        border: '1px solid rgba(0, 196, 159, 0.4)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}
                                >
                                    Last 30 Days
                                </button>
                                <button
                                    onClick={() => setExportPreset('thisMonth')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'rgba(0, 196, 159, 0.2)',
                                        border: '1px solid rgba(0, 196, 159, 0.4)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}
                                >
                                    This Month
                                </button>
                                <button
                                    onClick={() => setExportPreset('lastMonth')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'rgba(0, 196, 159, 0.2)',
                                        border: '1px solid rgba(0, 196, 159, 0.4)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}
                                >
                                    Last Month
                                </button>
                                <button
                                    onClick={() => setExportPreset('allTime')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'rgba(0, 196, 159, 0.2)',
                                        border: '1px solid rgba(0, 196, 159, 0.4)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}
                                >
                                    All Time
                                </button>
                            </div>
                        </div>

                        {/* Export Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={handleExportCSV}
                                style={{
                                    flex: '1 1 200px',
                                    padding: '1rem 1.5rem',
                                    background: 'linear-gradient(135deg, #00C49F, #00D4AA)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                📊 Export to CSV
                            </button>
                            <button
                                onClick={handleExportPDF}
                                style={{
                                    flex: '1 1 200px',
                                    padding: '1rem 1.5rem',
                                    background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                📄 Export to PDF
                            </button>
                        </div>

                        {/* Export Info */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(0, 196, 159, 0.1)',
                            borderRadius: '8px',
                            borderLeft: '3px solid #00C49F',
                            fontSize: '0.85rem',
                            color: 'rgba(255, 255, 255, 0.8)'
                        }}>
                            <strong>💡 Tip:</strong> CSV files can be opened in Excel or Google Sheets for detailed analysis. 
                            PDF files provide a formatted financial summary report perfect for printing or sharing.
                        </div>
                    </div>
                </div>

                {/* Quick Stats Section - Spending by Category */}
                <div className={styles.quickStats} style={{ marginTop: '2rem' }}>
                    <h2 className={styles.statsTitle}>Spending By Category</h2>
                    {loading ? (
                        <p className={styles.statsDescription}>Loading spending data...</p>
                    ) : spendingData.length > 0 ? (
                        <div style={{ marginTop: '1.5rem' }}>
                            <ul style={{ 
                                listStyle: 'none', 
                                padding: 0, 
                                display: 'grid', 
                                gap: '1rem',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
                            }}>
                                {spendingData.map(item => (
                                    <li key={item.category} style={{
                                        background: 'rgba(137, 250, 255, 0.1)',
                                        border: '1px solid rgba(137, 250, 255, 0.2)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ 
                                            fontSize: '1rem', 
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            fontWeight: 500 
                                        }}>
                                            📊 {item.category}
                                        </span>
                                        <span style={{ 
                                            fontSize: '1.1rem', 
                                            color: 'var(--primary-color)',
                                            fontWeight: 600 
                                        }}>
                                            ₹{item.totalAmount.toFixed(2)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className={styles.statsDescription}>
                            No spending data available yet. Start tracking your transactions!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
