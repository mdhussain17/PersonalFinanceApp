import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService, { type UserDto, type TransactionDto } from '../services/adminService';
import styles from './AdminDashboardPage.module.css';

const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [users, setUsers] = useState<UserDto[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [userTransactions, setUserTransactions] = useState<TransactionDto[]>([]);
    const [showTransactionsModal, setShowTransactionsModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            setLoading(true);
            // Load summary
            const summary = await adminService.getAdminSummary();
            setTotalUsers(summary.totalUsers);
            setTotalTransactions(summary.totalTransactions);

            // Load users
            const usersList = await adminService.getAllUsers();
            setUsers(usersList);
            
            setError('');
        } catch (err: any) {
            if (err.response?.status === 403) {
                setError('Access denied. Admin privileges required.');
                setTimeout(() => navigate('/dashboard'), 2000);
            } else {
                setError(err.response?.data?.message || 'Failed to load admin data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewTransactions = async (user: UserDto) => {
        try {
            setSelectedUser(user);
            const transactions = await adminService.getUserTransactions(user.id);
            setUserTransactions(transactions);
            setShowTransactionsModal(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load user transactions');
        }
    };

    const handleDeleteUser = async (userId: number, email: string) => {
        if (!window.confirm(`Are you sure you want to delete user: ${email}?\n\nThis action cannot be undone and will delete all their data (transactions, budgets, savings goals).`)) {
            return;
        }

        try {
            await adminService.deleteUser(userId);
            setSuccess(`User ${email} and all their data deleted successfully`);
            loadAdminData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const closeModal = () => {
        setShowTransactionsModal(false);
        setSelectedUser(null);
        setUserTransactions([]);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.transactionsContainer}>
                <div className={styles.header}>
                    <h1>🛡️ Admin Dashboard</h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '0.5rem' }}>
                        Manage users and monitor system activity
                    </p>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                {loading ? (
                    <p className={styles.noData}>Loading admin data...</p>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className={styles.section}>
                            <h2>System Overview</h2>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryCard} style={{ borderLeft: '4px solid #00C49F' }}>
                                    <div className={styles.summaryLabel}>Total Users</div>
                                    <div className={styles.summaryValue} style={{ color: '#00C49F' }}>
                                        {totalUsers}
                                    </div>
                                </div>
                                <div className={styles.summaryCard} style={{ borderLeft: '4px solid #0088FE' }}>
                                    <div className={styles.summaryLabel}>Total Transactions</div>
                                    <div className={styles.summaryValue} style={{ color: '#0088FE' }}>
                                        {totalTransactions}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Users List */}
                        <div className={styles.section}>
                            <h2>User Management</h2>
                            {users.length === 0 ? (
                                <p className={styles.noData}>No users found</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '12px',
                                        overflow: 'hidden'
                                    }}>
                                        <thead>
                                            <tr style={{
                                                background: 'rgba(0, 196, 159, 0.1)',
                                                borderBottom: '2px solid rgba(0, 196, 159, 0.3)'
                                            }}>
                                                <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                                                <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                                                <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                                                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id} style={{
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}>
                                                    <td style={{ padding: '1rem' }}>{user.id}</td>
                                                    <td style={{ padding: '1rem' }}>{user.email}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '12px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600,
                                                            background: user.role === 'ADMIN' 
                                                                ? 'rgba(255, 149, 0, 0.2)' 
                                                                : 'rgba(0, 196, 159, 0.2)',
                                                            color: user.role === 'ADMIN' 
                                                                ? '#ff9500' 
                                                                : '#00C49F'
                                                        }}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => handleViewTransactions(user)}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                marginRight: '0.5rem',
                                                                background: 'rgba(0, 196, 159, 0.2)',
                                                                border: '1px solid #00C49F',
                                                                borderRadius: '8px',
                                                                color: 'white',
                                                                cursor: 'pointer',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            👁️ View Transactions
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id, user.email)}
                                                            disabled={user.role === 'ADMIN'}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                background: user.role === 'ADMIN' 
                                                                    ? 'rgba(255, 255, 255, 0.1)' 
                                                                    : 'rgba(255, 59, 48, 0.2)',
                                                                border: user.role === 'ADMIN' 
                                                                    ? '1px solid rgba(255, 255, 255, 0.2)' 
                                                                    : '1px solid #ff3b30',
                                                                borderRadius: '8px',
                                                                color: user.role === 'ADMIN' 
                                                                    ? 'rgba(255, 255, 255, 0.4)' 
                                                                    : 'white',
                                                                cursor: user.role === 'ADMIN' 
                                                                    ? 'not-allowed' 
                                                                    : 'pointer',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Transactions Modal */}
                {showTransactionsModal && selectedUser && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '2rem'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                            borderRadius: '20px',
                            padding: '2rem',
                            maxWidth: '900px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            border: '1px solid rgba(0, 196, 159, 0.3)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2>Transactions for {selectedUser.email}</h2>
                                <button
                                    onClick={closeModal}
                                    style={{
                                        background: 'rgba(255, 59, 48, 0.2)',
                                        border: '1px solid #ff3b30',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        padding: '0.5rem 1rem',
                                        fontWeight: 600
                                    }}
                                >
                                    ✕ Close
                                </button>
                            </div>

                            {userTransactions.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
                                    No transactions found for this user
                                </p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '12px'
                                    }}>
                                        <thead>
                                            <tr style={{
                                                background: 'rgba(0, 196, 159, 0.1)',
                                                borderBottom: '2px solid rgba(0, 196, 159, 0.3)'
                                            }}>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Description</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Type</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Category</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userTransactions.map((txn) => (
                                                <tr key={txn.id} style={{
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        {new Date(txn.date).toLocaleDateString('en-IN')}
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>{txn.name}</td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '8px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            background: txn.type.toLowerCase() === 'income' 
                                                                ? 'rgba(52, 199, 89, 0.2)' 
                                                                : 'rgba(255, 59, 48, 0.2)',
                                                            color: txn.type.toLowerCase() === 'income' 
                                                                ? '#34c759' 
                                                                : '#ff3b30'
                                                        }}>
                                                            {txn.type}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>{txn.category}</td>
                                                    <td style={{ 
                                                        padding: '0.75rem', 
                                                        textAlign: 'right',
                                                        fontWeight: 600,
                                                        color: txn.type.toLowerCase() === 'income' 
                                                            ? '#34c759' 
                                                            : '#ff3b30'
                                                    }}>
                                                        {txn.type.toLowerCase() === 'income' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminDashboardPage;
