import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import budgetService from '../services/budgetService';
import type { Budget } from '../services/budgetService';
import styles from './TransactionsPage.module.css'; // Reuse the same styling
import ChatBot from '../components/ChatBot';

interface BudgetWithTracking extends Budget {
    spent: number;
    remaining: number;
    percentageUsed: number;
    transactionCount: number;
    recentTransactions: any[];
}

const BudgetPage: React.FC = () => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [budgetsWithTracking, setBudgetsWithTracking] = useState<BudgetWithTracking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Budget>({
        category: '',
        amount: 0,
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0], // Last day of current month
    });

    // Custom category state
    const [showCustomCategory, setShowCustomCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState('');

    // Month and Year selection state
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Budget categories
    const categories = [
        'Rent', 'Food', 'Transportation', 'Utilities', 
        'Entertainment', 'Healthcare', 'Education', 
        'Shopping', 'Savings', 'Other'
    ];

    // Months array
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate years array (last 5 years to next 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    // Function to calculate first and last day of selected month/year
    const calculateDates = (month: number, year: number) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        return {
            startDate: firstDay.toISOString().split('T')[0],
            endDate: lastDay.toISOString().split('T')[0]
        };
    };

    // Update dates when month or year changes
    useEffect(() => {
        const dates = calculateDates(selectedMonth, selectedYear);
        setFormData(prev => ({
            ...prev,
            startDate: dates.startDate,
            endDate: dates.endDate
        }));
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        // Check authentication
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/signin');
            return;
        }
        loadData();
        
        // Add visibility change listener to refresh when user comes back to this page
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('🔄 Page is visible again - refreshing data...');
                loadData();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Cleanup listener on unmount
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            // ✅ NEW: Backend now calculates spent/remaining automatically!
            const budgetsResponse = await budgetService.getBudgets();
            
            console.log('📊 Budgets received from backend:', budgetsResponse.data);
            console.log('📊 First budget detail:', budgetsResponse.data[0]);
            console.log('📊 First budget spent:', budgetsResponse.data[0]?.spent);
            console.log('📊 First budget remaining:', budgetsResponse.data[0]?.remaining);
            
            setBudgets(budgetsResponse.data);
            
            // Map to tracking format (backend already calculated spent/remaining)
            const tracked = budgetsResponse.data.map(budget => {
                const spent = budget.spent || 0;
                const remaining = budget.remaining !== undefined ? budget.remaining : (budget.amount - spent);
                const percentageUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                
                return {
                    ...budget,
                    spent,
                    remaining,
                    percentageUsed,
                    transactionCount: 0, // Backend doesn't provide this yet
                    recentTransactions: [] // Backend doesn't provide this yet
                };
            });
            
            setBudgetsWithTracking(tracked);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadBudgets = async () => {
        // Reload all data to refresh tracking
        await loadData();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        console.log('🚀 Submit started - EditingId:', editingId, 'FormData:', formData);

        if (!formData.category || formData.amount <= 0) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            if (editingId) {
                console.log('📝 Updating budget with ID:', editingId);
                const response = await budgetService.updateBudget(editingId, formData);
                console.log('✅ Update response:', response.data);
                setSuccess('Budget updated successfully!');
            } else {
                console.log('➕ Creating new budget');
                const response = await budgetService.createBudget(formData);
                console.log('✅ Create response:', response.data);
                setSuccess('Budget created successfully!');
            }
            
            resetForm();
            loadBudgets();
            // Dispatch event to notify other components (e.g., Navbar)
            window.dispatchEvent(new Event('budgetUpdated'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('❌ Full error object:', err);
            console.error('❌ Error response:', err.response);
            console.error('❌ Error data:', err.response?.data);
            console.error('❌ Error status:', err.response?.status);
            console.error('❌ Error message:', err.message);
            setError(err.response?.data?.message || 'Failed to save budget');
        }
    };

    const handleEdit = (budget: Budget) => {
        console.log('✏️ Editing budget:', budget);
        
        // Check if the category is a custom one (not in predefined list)
        const isCustomCategory = budget.category && !categories.includes(budget.category);
        
        // Extract month and year from start date
        const startDate = new Date(budget.startDate);
        setSelectedMonth(startDate.getMonth());
        setSelectedYear(startDate.getFullYear());
        
        setFormData({
            id: budget.id,  // ← IMPORTANT: Include the ID
            category: budget.category,
            amount: budget.amount,
            startDate: budget.startDate,
            endDate: budget.endDate,
        });
        
        // If custom category, show the custom input
        if (isCustomCategory) {
            setShowCustomCategory(true);
            setCustomCategory(budget.category);
        } else {
            setShowCustomCategory(false);
            setCustomCategory('');
        }
        
        setEditingId(budget.id!);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this budget?')) {
            return;
        }

        try {
            await budgetService.deleteBudget(id);
            setSuccess('Budget deleted successfully!');
            loadBudgets();
            // Dispatch event to notify other components (e.g., Navbar)
            window.dispatchEvent(new Event('budgetUpdated'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete budget');
            console.error('Error deleting budget:', err);
        }
    };

    const resetForm = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
        
        const dates = calculateDates(currentMonth, currentYear);
        
        setFormData({
            category: '',
            amount: 0,
            startDate: dates.startDate,
            endDate: dates.endDate
        });
        setEditingId(null);
        setIsEditing(false);
        setShowCustomCategory(false);
        setCustomCategory('');
    };

    const getBudgetStatus = (percentageUsed: number) => {
        if (percentageUsed >= 100) return { color: '#ff3b30', text: 'EXCEEDED', emoji: '🚨' };
        if (percentageUsed >= 90) return { color: '#ff9500', text: 'WARNING', emoji: '⚠️' };
        if (percentageUsed >= 80) return { color: '#ffc107', text: 'CAUTION', emoji: '⚠️' };
        return { color: '#34c759', text: 'ON TRACK', emoji: '✅' };
    };

    const handleAddTransaction = (category: string) => {
        // Navigate to transactions page with category pre-filled
        navigate('/transactions', { state: { category, type: 'expense' } });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        }));
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.transactionsContainer}>
                <div className={styles.header}>
                    <h1>Budget Planning</h1>
                </div>

                {/* AI Chatbot */}
                <ChatBot context="budget" />

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                {/* Budget Overview Summary */}
                {!loading && budgetsWithTracking.length > 0 && (
                    <div className={styles.section}>
                        <h2>Budget Overview</h2>
                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryCard} style={{ borderLeft: '4px solid var(--primary-color)' }}>
                                <div className={styles.summaryLabel}>Total Planned</div>
                                <div className={styles.summaryValue} style={{ color: 'var(--primary-color)' }}>
                                    ₹{budgetsWithTracking.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
                                </div>
                            </div>
                            <div className={styles.summaryCard} style={{ borderLeft: '4px solid #ff3b30' }}>
                                <div className={styles.summaryLabel}>Total Spent</div>
                                <div className={styles.summaryValue} style={{ color: '#ff3b30' }}>
                                    ₹{budgetsWithTracking.reduce((sum, b) => sum + b.spent, 0).toFixed(2)}
                                </div>
                            </div>
                            <div className={styles.summaryCard} style={{ borderLeft: '4px solid #34c759' }}>
                                <div className={styles.summaryLabel}>Total Remaining</div>
                                <div className={styles.summaryValue} style={{ 
                                    color: budgetsWithTracking.reduce((sum, b) => sum + b.remaining, 0) >= 0 ? '#34c759' : '#ff3b30'
                                }}>
                                    ₹{budgetsWithTracking.reduce((sum, b) => sum + b.remaining, 0).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Budget Form */}
                {isEditing && (
                    <div className={styles.formSection}>
                        <div className={styles.formHeader}>
                            <h2>{editingId ? 'Edit Budget' : 'Create New Budget'}</h2>
                            <button 
                                className={styles.cancelButton}
                                onClick={resetForm}
                            >
                                ✕ Cancel
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Category *</label>
                                    <select
                                        name="category"
                                        value={showCustomCategory ? 'Other' : formData.category}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === 'Other') {
                                                setShowCustomCategory(true);
                                                setCustomCategory('');
                                                setFormData({ ...formData, category: '' });
                                            } else {
                                                setShowCustomCategory(false);
                                                setFormData({ ...formData, category: value });
                                            }
                                        }}
                                        required
                                        className={styles.select}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    
                                    {showCustomCategory && (
                                        <input
                                            type="text"
                                            placeholder="Enter custom category name"
                                            value={customCategory}
                                            onChange={(e) => {
                                                setCustomCategory(e.target.value);
                                                setFormData({ ...formData, category: e.target.value });
                                            }}
                                            required
                                            className={styles.input}
                                            style={{ marginTop: '0.5rem' }}
                                        />
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Budget Amount (₹) *</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        onFocus={() => {
                                            if (formData.amount === 0) {
                                                setFormData(prev => ({ ...prev, amount: '' as any }));
                                            }
                                        }}
                                        onBlur={() => {
                                            if (!formData.amount || formData.amount === 0) {
                                                setFormData(prev => ({ ...prev, amount: 0 }));
                                            }
                                        }}
                                        min="0"
                                        step="0.01"
                                        required
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Month *</label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        required
                                        className={styles.select}
                                    >
                                        {months.map((month, index) => (
                                            <option key={month} value={index}>{month}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Year *</label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        required
                                        className={styles.select}
                                    >
                                        {years.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className={styles.formGroup} style={{ fontSize: '0.875rem', color: '#666', marginTop: '-0.5rem' }}>
                                Budget period: {formData.startDate} to {formData.endDate}
                            </div>

                            <div className={styles.buttonGroup}>
                                <button type="submit" className={styles.cancelButton} disabled={loading}>
                                    {loading ? 'Saving...' : (editingId ? 'Update Budget' : 'Create Budget')}
                                </button>
                                <button type="button" className={styles.cancelButton} onClick={resetForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Budgets List */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>My Budgets</h2>
                        {!isEditing && (
                            <button 
                                className={styles.addTransactionBtn}
                                onClick={() => setIsEditing(true)}
                            >
                                + Add Budget
                            </button>
                        )}
                    </div>

                    {loading && <p className={styles.noData}>Loading budgets...</p>}

                    {!loading && budgetsWithTracking.length === 0 && (
                        <p className={styles.noData}>No budgets yet. Click "Add Budget" to get started!</p>
                    )}

                    {!loading && budgetsWithTracking.length > 0 && (
                        <div className={styles.transactionsList}>
                            {budgetsWithTracking.map((budget) => {
                                const status = getBudgetStatus(budget.percentageUsed);
                                const budget_plain = budgets.find(b => b.id === budget.id)!;

                                return (
                                    <div 
                                        key={budget.id} 
                                        className={`${styles.transactionCard}`}
                                        style={{
                                            borderLeft: `4px solid ${status.color}`
                                        }}
                                    >
                                        <div className={styles.transactionMain}>
                                            <div className={styles.transactionDetails}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <h3>💼 {budget.category}</h3>
                                                    <span style={{ 
                                                        fontSize: '0.85rem', 
                                                        fontWeight: 600,
                                                        color: status.color,
                                                        padding: '0.25rem 0.75rem',
                                                        background: `${status.color}20`,
                                                        borderRadius: '12px'
                                                    }}>
                                                        {status.emoji} {status.text}
                                                    </span>
                                                </div>
                                                
                                                {/* Budget Overview */}
                                                <div style={{ 
                                                    marginTop: '1rem',
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                                    gap: '1rem',
                                                    padding: '1rem',
                                                    background: 'rgba(255, 255, 255, 0.03)',
                                                    borderRadius: '8px'
                                                }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '0.25rem' }}>
                                                            PLANNED
                                                        </div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                                                            ₹{budget.amount.toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '0.25rem' }}>
                                                            SPENT
                                                        </div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ff3b30' }}>
                                                            ₹{budget.spent.toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '0.25rem' }}>
                                                            REMAINING
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: '1.1rem', 
                                                            fontWeight: 600, 
                                                            color: budget.remaining >= 0 ? '#34c759' : '#ff3b30'
                                                        }}>
                                                            ₹{budget.remaining.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div style={{ marginTop: '1rem' }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        marginBottom: '0.5rem',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        <span>{budget.transactionCount} transactions</span>
                                                        <span style={{ fontWeight: 600, color: status.color }}>
                                                            {budget.percentageUsed.toFixed(1)}% used
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '10px',
                                                        height: '12px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            width: `${Math.min(budget.percentageUsed, 100)}%`,
                                                            height: '100%',
                                                            background: status.color,
                                                            transition: 'width 0.5s ease',
                                                            borderRadius: '10px'
                                                        }} />
                                                    </div>
                                                </div>

                                                {/* Recent Transactions */}
                                                {budget.recentTransactions.length > 0 && (
                                                    <div style={{ marginTop: '1rem' }}>
                                                        <div style={{ 
                                                            fontSize: '0.75rem', 
                                                            color: 'rgba(255, 255, 255, 0.5)',
                                                            marginBottom: '0.5rem',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            Recent Transactions
                                                        </div>
                                                        {budget.recentTransactions.map(txn => (
                                                            <div key={txn.id} style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                padding: '0.5rem',
                                                                background: 'rgba(255, 255, 255, 0.03)',
                                                                borderRadius: '6px',
                                                                marginBottom: '0.25rem',
                                                                fontSize: '0.85rem'
                                                            }}>
                                                                <span>• {txn.name}</span>
                                                                <span style={{ color: '#ff3b30', fontWeight: 600 }}>
                                                                    -₹{txn.amount.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Date Range */}
                                                <div className={styles.transactionMeta} style={{ marginTop: '1rem' }}>
                                                    <span className={styles.date}>
                                                        📅 {new Date(budget.startDate).toLocaleDateString('en-IN')} - {new Date(budget.endDate).toLocaleDateString('en-IN')}
                                                    </span>
                                                </div>

                                                {/* Quick Add Transaction Button */}
                                                <button
                                                    onClick={() => handleAddTransaction(budget.category)}
                                                    style={{
                                                        marginTop: '1rem',
                                                        padding: '0.6rem 1rem',
                                                        background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        width: '100%',
                                                        transition: 'transform 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    + Add {budget.category} Transaction
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.transactionIconActions}>
                                            <button 
                                                className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                                                onClick={() => handleDelete(budget.id!)}
                                                disabled={loading}
                                                title="Delete budget"
                                            >
                                                🗑️
                                            </button>
                                            <button 
                                                className={styles.iconBtn}
                                                onClick={() => handleEdit(budget_plain)}
                                                disabled={loading}
                                                title="Edit budget"
                                            >
                                                ✏️
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetPage;
