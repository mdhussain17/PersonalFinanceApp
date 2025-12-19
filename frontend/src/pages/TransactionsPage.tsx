import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import profileService from '../services/profileService';
import transactionService, { type Transaction } from '../services/transactionService';
import savingsGoalService, { type SavingsGoal } from '../services/savingsGoalService';
import styles from './TransactionsPage.module.css';

// Predefined categories for income and expenses
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift'];
const EXPENSE_CATEGORIES = ['Rent', 'Food', 'Travel', 'Utilities', 'Entertainment', 'Healthcare', 'Education', 'Shopping'];

const TransactionsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    
    // Financial Information from profile
    const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
    const [savingsGoal, setSavingsGoal] = useState<number>(0);
    const [targetExpenses, setTargetExpenses] = useState<number>(0);
    
    // Transaction summary from backend
    const [backendTotalIncome, setBackendTotalIncome] = useState<number>(0);
    const [backendTotalExpenses, setBackendTotalExpenses] = useState<number>(0);
    const [backendTotalSavings, setBackendTotalSavings] = useState<number>(0);
    
    // Savings goals for dropdown
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
    
    // Custom category state
    const [showCustomCategory, setShowCustomCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState('');
    
    // Balance warning state
    const [showBalanceWarning, setShowBalanceWarning] = useState(false);
    const [pendingTransaction, setPendingTransaction] = useState<Transaction | null>(null);
    
    // Form fields
    const [formData, setFormData] = useState<Transaction>({
        type: 'expense',
        amount: 0,
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Check authentication and load data
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/signin');
            return;
        }
        loadProfile();
        loadTransactions();
        loadTransactionSummary();
        loadSavingsGoals();
    }, [navigate]);

    // Handle navigation state (pre-fill form when coming from Budget/Savings pages)
    useEffect(() => {
        const state = location.state as { type?: string; category?: string } | null;
        if (state) {
            console.log('📍 Received navigation state:', state);
            
            // Pre-fill the form with provided data
            if (state.type) {
                setFormData(prev => ({
                    ...prev,
                    type: state.type as 'income' | 'expense',
                    category: state.category || ''
                }));
            }
            
            // If category is provided and doesn't exist in predefined lists, show custom input
            if (state.category) {
                const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
                if (!allCategories.includes(state.category)) {
                    setShowCustomCategory(true);
                    setCustomCategory(state.category);
                }
            }
            
            // Open the form
            setIsEditing(true);
            
            // Clear the location state to prevent re-applying on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Load profile financial information
    const loadProfile = async () => {
        try {
            const response = await profileService.getProfile();
            if (response.data) {
                setMonthlyIncome(parseFloat(response.data.monthlyIncome) || 0);
                setSavingsGoal(parseFloat(response.data.savingsGoal) || 0);
                setTargetExpenses(parseFloat(response.data.targetExpenses) || 0);
            }
        } catch (err) {
            console.log('No profile data found, using defaults');
        }
    };

    // Load all transactions from backend
    const loadTransactions = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('🔄 Loading transactions from backend...');
            const response = await transactionService.getUserTransactions();
            console.log('✅ Loaded transactions:', response.data.length);
            console.log('📋 First transaction:', response.data[0]);
            setTransactions(response.data);
            setLoading(false);
        } catch (err: any) {
            setError('Failed to load transactions');
            setLoading(false);
            console.error('Load error:', err);
        }
    };

    // Load transaction summary from backend
    const loadTransactionSummary = async () => {
        try {
            console.log('🔍 Fetching transaction summary from backend...');
            const response = await transactionService.getTransactionSummary();
            console.log('📊 Transaction summary RAW response:', JSON.stringify(response.data, null, 2));
            const { totalIncome, totalExpenses, totalSavings } = response.data;
            console.log(`💰 Total Income: ${totalIncome}`);
            console.log(`💸 Total Expenses: ${totalExpenses}`);
            console.log(`💎 Total Savings: ${totalSavings}`);
            setBackendTotalIncome(totalIncome || 0);
            setBackendTotalExpenses(totalExpenses || 0);
            setBackendTotalSavings(totalSavings || 0);
        } catch (err: any) {
            console.error('❌ Failed to load transaction summary:', err);
            console.error('❌ Error response:', err.response?.data);
        }
    };

    const loadSavingsGoals = async () => {
        try {
            const response = await savingsGoalService.getSavingsGoals();
            setSavingsGoals(response.data || []);
            console.log('📋 Loaded savings goals:', response.data);
        } catch (err) {
            console.error('Failed to load savings goals:', err);
            setSavingsGoals([]);
        }
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Special handling for type change - reset category
        if (name === 'type') {
            setFormData(prev => ({
                ...prev,
                type: value as 'income' | 'expense' | 'savings',  // Added 'savings'
                category: '' // Reset category when type changes
            }));
            setShowCustomCategory(false);
            setCustomCategory('');
        } else if (name === 'category') {
            if (value === 'custom') {
                setShowCustomCategory(true);
                setFormData(prev => ({ ...prev, category: '' }));
            } else {
                setShowCustomCategory(false);
                setCustomCategory('');
                setFormData(prev => ({ ...prev, category: value }));
            }
        } else if (name === 'customCategory') {
            setCustomCategory(value);
            setFormData(prev => ({ ...prev, category: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'amount' ? parseFloat(value) || 0 : value
            }));
        }
    };

    // Submit form (Create or Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation - Allow negative amounts for savings withdrawals, but require positive for income/expense
        if (formData.type === 'savings') {
            if (formData.amount === 0) {
                setError('Please enter a valid amount (positive for contribution, negative for withdrawal)');
                return;
            }
            // Check if a savings goal is selected
            if (!formData.category || formData.category.trim() === '') {
                setError('Please select a savings goal');
                return;
            }
            // Verify the selected category is a valid savings goal
            const goalExists = savingsGoals.some(goal => goal.goalName === formData.category);
            if (!goalExists) {
                setError('Selected savings goal no longer exists. Please refresh and try again.');
                return;
            }
        } else {
            if (formData.amount <= 0) {
                setError('Please enter a valid amount greater than 0');
                return;
            }
            if (!formData.category || formData.category.trim() === '') {
                setError('Please select or enter a category');
                return;
            }
        }
        
        // Check if transaction will make balance negative (for expenses and savings)
        if (formData.type === 'expense' || (formData.type === 'savings' && formData.amount > 0)) {
            const currentBalance = (targetExpenses + backendTotalIncome) - (backendTotalExpenses + backendTotalSavings);
            const newBalance = currentBalance - formData.amount;
            
            if (newBalance < 0) {
                // Show warning modal
                setPendingTransaction(formData);
                setShowBalanceWarning(true);
                return; // Don't proceed with submission yet
            }
        }
        
        // Proceed with submission
        await submitTransaction(formData);
    };

    // Actual submission logic (separated for confirmation flow)
    const submitTransaction = async (transactionData: Transaction) => {
        // Auto-generate name from category if not provided
        const dataToSubmit = {
            ...transactionData,
            name: transactionData.category // Use category as name
        };
        
        console.log('📤 Submitting transaction data:', JSON.stringify(dataToSubmit, null, 2));
        console.log('📝 Transaction Type being sent:', dataToSubmit.type);
        
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (editingId) {
                console.log('🔄 UPDATING transaction ID:', editingId);
                const response = await transactionService.updateTransaction(editingId, dataToSubmit);
                console.log('✅ Update response:', response.data);
                setSuccess('✅ Transaction updated successfully!');
                
                // Force reload transactions to get fresh data
                resetForm();
                await loadTransactions();
                await loadTransactionSummary();
                await loadSavingsGoals(); // Reload goals to update current amounts
                
                // Dispatch event to notify other components (e.g., Navbar for budget alerts)
                window.dispatchEvent(new Event('transactionUpdated'));
                
                // Hide success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                console.log('➕ CREATING new transaction');
                const response = await transactionService.createTransaction(dataToSubmit);
                console.log('✅ Create response:', response.data);
                setSuccess('✅ Transaction added successfully!');
                
                resetForm();
                await loadTransactions();
                await loadTransactionSummary();
                await loadSavingsGoals(); // Reload goals to update current amounts
                
                // Dispatch event to notify other components (e.g., Navbar for budget alerts)
                window.dispatchEvent(new Event('transactionUpdated'));
                
                setTimeout(() => setSuccess(''), 3000);
            }
            
            setLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save transaction');
            setLoading(false);
            console.error('❌ Save error:', err);
            console.error('❌ Error response:', err.response?.data);
        }
    };

    // Handle balance warning confirmation
    const handleConfirmNegativeBalance = async () => {
        setShowBalanceWarning(false);
        if (pendingTransaction) {
            await submitTransaction(pendingTransaction);
            setPendingTransaction(null);
        }
    };

    const handleCancelNegativeBalance = () => {
        setShowBalanceWarning(false);
        setPendingTransaction(null);
        setLoading(false);
    };

    // Delete transaction
    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            setLoading(true);
            await transactionService.deleteTransaction(id);
            setSuccess('✅ Transaction deleted successfully!');
            await loadTransactions();
            await loadTransactionSummary(); // Reload summary after deleting
            
            // Dispatch event to notify other components (e.g., Navbar for budget alerts)
            window.dispatchEvent(new Event('transactionUpdated'));
            
            setLoading(false);
        } catch (err: any) {
            setError('Failed to delete transaction');
            setLoading(false);
            console.error('Delete error:', err);
        }
    };

    // Start editing a transaction
    const handleEdit = (transaction: Transaction) => {
        setFormData({
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description || '',
            date: transaction.date
        });
        
        // Check if category is custom (not in predefined lists)
        const categories = transaction.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        if (!categories.includes(transaction.category)) {
            setShowCustomCategory(true);
            setCustomCategory(transaction.category);
        } else {
            setShowCustomCategory(false);
            setCustomCategory('');
        }
        
        setEditingId(transaction.id || null);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            type: 'expense',
            amount: 0,
            category: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        setEditingId(null);
        setIsEditing(false);
        setShowCustomCategory(false);
        setCustomCategory('');
    };

    // Calculate totals with new logic
    const calculateTotals = () => {
        // Step 1: Calculate available money = Monthly Income - Savings Goal
        const availableMoney = monthlyIncome - savingsGoal;
        
        // Step 2: Add income transactions to available money
        const incomeTransactions = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Step 3: Calculate expenses
        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Step 4: Total income = Available Money + Income Transactions
        const totalIncome = availableMoney + incomeTransactions;
        
        // Step 5: Calculate balance
        const balance = totalIncome - expenses;
        
        // Step 7: Calculate expense warning level
        let expenseWarning = null;
        if (targetExpenses > 0 && expenses > 0) {
            const percentage = (expenses / targetExpenses) * 100;
            
            if (percentage >= 100) {
                expenseWarning = {
                    level: 'danger',
                    message: `⚠️ Alert! You've exceeded your target expenses by ₹${(expenses - targetExpenses).toFixed(2)}`,
                    percentage: percentage.toFixed(1)
                };
            } else if (percentage >= 90) {
                expenseWarning = {
                    level: 'warning',
                    message: `⚡ Warning! You've used ${percentage.toFixed(1)}% of your target expenses. Only ₹${(targetExpenses - expenses).toFixed(2)} remaining.`,
                    percentage: percentage.toFixed(1)
                };
            } else if (percentage >= 80) {
                expenseWarning = {
                    level: 'caution',
                    message: `📊 Heads up! You've used ${percentage.toFixed(1)}% of your target expenses. ₹${(targetExpenses - expenses).toFixed(2)} remaining.`,
                    percentage: percentage.toFixed(1)
                };
            }
        }
        
        return { 
            availableMoney,      // Monthly Income - Savings Goal
            incomeTransactions,  // Extra income from transactions
            totalIncome,         // Available + Income Transactions (+ Savings if toggled)
            expenses, 
            balance,
            savingsAmount: savingsGoal,  // For display
            expenseWarning       // Warning notification object
        };
    };

    const totals = calculateTotals();
    const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    if (loading && !isEditing) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Balance Warning Modal */}
            {showBalanceWarning && pendingTransaction && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#1a1a2e',
                        padding: '2rem',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        width: '90%',
                        border: '2px solid #ff6b6b'
                    }}>
                        <h2 style={{ color: '#ff6b6b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ⚠️ Negative Balance Warning
                        </h2>
                        <p style={{ color: '#e0e0e0', marginBottom: '1rem', lineHeight: '1.6' }}>
                            This transaction will make your balance <strong style={{ color: '#ff6b6b' }}>negative</strong>.
                        </p>
                        <div style={{
                            background: 'rgba(255, 107, 107, 0.1)',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            borderLeft: '4px solid #ff6b6b'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#aaa' }}>Current Balance:</span>
                                <span style={{ color: '#4ade80', fontWeight: 'bold' }}>
                                    ₹{((targetExpenses + backendTotalIncome) - (backendTotalExpenses + backendTotalSavings)).toFixed(2)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#aaa' }}>Transaction Amount:</span>
                                <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                                    -₹{pendingTransaction.amount.toFixed(2)}
                                </span>
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#aaa' }}>New Balance:</span>
                                    <span style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                        ₹{(((targetExpenses + backendTotalIncome) - (backendTotalExpenses + backendTotalSavings)) - pendingTransaction.amount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p style={{ color: '#ffa500', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            💡 This might indicate overspending or could be used for tracking credit/loans.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleCancelNegativeBalance}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmNegativeBalance}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#ff6b6b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Continue Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.transactionsContainer}>
                <div className={styles.header}>
                    <h1>Expense & Income Tracking</h1>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                {/* Expense Warning Notification */}
                {totals.expenseWarning && (
                    <div className={`${styles.warningBanner} ${styles[totals.expenseWarning.level]}`}>
                        <div className={styles.warningContent}>
                            <span className={styles.warningMessage}>{totals.expenseWarning.message}</span>
                            <div className={styles.progressBar}>
                                <div 
                                    className={styles.progressFill}
                                    style={{ width: `${Math.min(parseFloat(totals.expenseWarning.percentage), 100)}%` }}
                                ></div>
                            </div>
                            <span className={styles.warningPercentage}>
                                {totals.expenseWarning.percentage}% of target expenses
                            </span>
                        </div>
                    </div>
                )}

                {/* Financial Information from Profile */}
                <div className={styles.section}>
                    <h2>Financial Overview</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <span className={styles.infoLabel}>Monthly Income</span>
                            <span className={styles.infoValue}>₹{monthlyIncome.toFixed(2)}</span>
                        </div>
                        <div className={styles.infoCard}>
                            <span className={styles.infoLabel}>Total Savings</span>
                            <span className={styles.infoValue} style={{ color: '#00C49F' }}>₹{backendTotalSavings.toFixed(2)}</span>
                        </div>
                        <div className={styles.infoCard}>
                            <span className={styles.infoLabel}>Target Expenses</span>
                            <span className={styles.infoValue}>₹{targetExpenses.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className={styles.section}>
                    <div className={styles.summaryHeader}>
                        <h2>Transaction Summary</h2>
                    </div>
                    
                    <div className={styles.summaryGrid}>
                        <div className={`${styles.summaryCard} ${styles.incomeCard}`}>
                            <span className={styles.summaryLabel}>Total Income</span>
                            <span className={styles.summaryValue}>
                                ₹{(targetExpenses + backendTotalIncome).toFixed(2)}
                            </span>
                            <div className={styles.breakdown}>
                                <small>Target Budget: ₹{targetExpenses.toFixed(2)}</small>
                                {backendTotalIncome > 0 && (
                                    <small>+ Extra Income: ₹{backendTotalIncome.toFixed(2)}</small>
                                )}
                            </div>
                        </div>
                        <div className={`${styles.summaryCard} ${styles.expenseCard}`}>
                            <span className={styles.summaryLabel}>Total Expenses</span>
                            <span className={styles.summaryValue}>₹{(backendTotalExpenses + backendTotalSavings).toFixed(2)}</span>
                            <div className={styles.breakdown}>
                                {backendTotalExpenses > 0 && (
                                    <small>Expenses: ₹{backendTotalExpenses.toFixed(2)}</small>
                                )}
                                {backendTotalSavings > 0 && (
                                    <small>+ Savings: ₹{backendTotalSavings.toFixed(2)}</small>
                                )}
                            </div>
                        </div>
                        <div className={`${styles.summaryCard} ${styles.balanceCard}`}>
                            <span className={styles.summaryLabel}>Balance</span>
                            <span className={`${styles.summaryValue} ${((targetExpenses + backendTotalIncome) - (backendTotalExpenses + backendTotalSavings)) < 0 ? styles.negative : styles.positive}`}>
                                ₹{(targetExpenses + backendTotalIncome - backendTotalExpenses - backendTotalSavings).toFixed(2)}
                            </span>
                            {backendTotalSavings > 0 && (
                                <div className={styles.savingsInfo}>
                                    <small>💰 Saved for Goals: ₹{backendTotalSavings.toFixed(2)}</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add/Edit Transaction Form */}
                {isEditing && (
                    <div className={styles.section}>
                        <h2>{editingId ? 'Edit Transaction' : 'Add New Transaction'}</h2>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Transaction Type *</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        required
                                    >
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                        <option value="savings">Savings</option>
                                    </select>
                                    {/* Display hint for savings type */}
                                    {formData.type === 'savings' && (
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#00C49F',
                                            marginTop: '0.5rem',
                                            padding: '0.5rem',
                                            background: 'rgba(0, 196, 159, 0.1)',
                                            borderRadius: '6px',
                                            borderLeft: '3px solid #00C49F'
                                        }}>
                                            <div style={{ marginBottom: '0.25rem' }}>
                                                💰 <strong>Contribution:</strong> Enter positive amount (e.g., 1000)
                                            </div>
                                            <div>
                                                ⬅️ <strong>Withdrawal:</strong> Enter negative amount (e.g., -500)
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Amount (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="amount"
                                        value={formData.amount || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter positive for savings, negative for withdrawal"
                                        disabled={loading}
                                        required
                                    />
                                    {formData.type === 'savings' && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentAmount = Math.abs(formData.amount || 0);
                                                    setFormData(prev => ({ ...prev, amount: currentAmount }));
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    background: formData.amount >= 0 ? '#00C49F' : 'rgba(255,255,255,0.1)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: formData.amount >= 0 ? '600' : '400'
                                                }}
                                            >
                                                💰 Contribution
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentAmount = Math.abs(formData.amount || 0);
                                                    setFormData(prev => ({ ...prev, amount: -currentAmount }));
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    background: formData.amount < 0 ? '#ff9500' : 'rgba(255,255,255,0.1)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: formData.amount < 0 ? '600' : '400'
                                                }}
                                            >
                                                ⬅️ Withdrawal
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>
                                        {formData.type === 'savings' ? 'Select Savings Goal *' : 'Category *'}
                                    </label>
                                    
                                    {formData.type === 'savings' ? (
                                        // Savings Goal Selector
                                        <>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                required
                                            >
                                                <option value="">Choose a savings goal</option>
                                                {savingsGoals.map(goal => (
                                                    <option key={goal.id} value={goal.goalName}>
                                                        {goal.goalName} (₹{goal.currentAmount.toFixed(0)} / ₹{goal.targetAmount.toFixed(0)})
                                                    </option>
                                                ))}
                                            </select>
                                            {savingsGoals.length === 0 && (
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    color: '#ff9500',
                                                    marginTop: '0.5rem',
                                                    padding: '0.5rem',
                                                    background: 'rgba(255, 149, 0, 0.1)',
                                                    borderRadius: '6px',
                                                    borderLeft: '3px solid #ff9500'
                                                }}>
                                                    ⚠️ No savings goals found. Create one in the Savings Goals page first.
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        // Regular Category Selector (Income/Expense)
                                        <select
                                            name="category"
                                            value={showCustomCategory ? 'custom' : formData.category}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            required={!showCustomCategory}
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            <option value="custom">+ Add New Category</option>
                                        </select>
                                    )}
                                </div>

                                {showCustomCategory && formData.type !== 'savings' && (
                                    <div className={styles.formGroup}>
                                        <label>Custom Category *</label>
                                        <input
                                            type="text"
                                            name="customCategory"
                                            value={customCategory}
                                            onChange={handleInputChange}
                                            placeholder="Enter custom category"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <label>Date *</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description (Optional)</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Add notes about this transaction..."
                                    rows={3}
                                    disabled={loading}
                                />
                            </div>

                            <div className={styles.buttonGroup}>
                                <button 
                                    type="submit" 
                                    className={styles.saveButton}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : (editingId ? 'Update Transaction' : 'Add Transaction')}
                                </button>
                                <button 
                                    type="button" 
                                    className={styles.cancelButton}
                                    onClick={resetForm}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Transactions List */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Transaction History</h2>
                        {!isEditing && (
                            <button 
                                className={styles.addTransactionBtn}
                                onClick={() => setIsEditing(true)}
                            >
                                + Add Transaction
                            </button>
                        )}
                    </div>
                    {!loading && transactions.length === 0 && (
                        <p className={styles.noData}>No transactions yet. Click "Add Transaction" to get started!</p>
                    )}

                    {!loading && transactions.length > 0 && (
                        <div className={styles.transactionsList}>
                            {transactions.map((transaction) => {
                                const transType = transaction.type.toLowerCase();
                                const getCardStyle = () => {
                                    if (transType === 'income') return styles.incomeTransaction;
                                    if (transType === 'savings') return styles.savingsTransaction;
                                    return styles.expenseTransaction;
                                };
                                const getAmountStyle = () => {
                                    if (transType === 'income') return styles.incomeAmount;
                                    if (transType === 'savings') return styles.savingsAmount;
                                    return styles.expenseAmount;
                                };
                                const getAmountPrefix = () => {
                                    if (transType === 'income') return '+';
                                    if (transType === 'savings') return transaction.amount >= 0 ? '💰' : '⬅️';
                                    return '-';
                                };
                                const getTypeLabel = () => {
                                    if (transType === 'income') return 'INCOME';
                                    if (transType === 'savings') return transaction.amount >= 0 ? 'SAVINGS' : 'WITHDRAWAL';
                                    return 'EXPENSE';
                                };
                                
                                return (
                                <div 
                                    key={transaction.id} 
                                    className={`${styles.transactionCard} ${getCardStyle()}`}
                                >
                                    <div className={styles.transactionMain}>
                                        <div className={styles.transactionDetails}>
                                            <h3>{transaction.category}</h3>
                                            <div className={styles.transactionMeta}>
                                                <span className={styles.date}>📅 {new Date(transaction.date).toLocaleDateString('en-IN', { 
                                                    day: 'numeric', 
                                                    month: 'short', 
                                                    year: 'numeric' 
                                                })}</span>
                                            </div>
                                            {transaction.description && (
                                                <p className={styles.description}>{transaction.description}</p>
                                            )}
                                        </div>
                                        <div className={styles.transactionAmount}>
                                            <span className={`${styles.amount} ${getAmountStyle()}`}>
                                                {getAmountPrefix()}₹{Math.abs(transaction.amount).toFixed(2)}
                                            </span>
                                            <span className={styles.type}>
                                                {getTypeLabel()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.transactionIconActions}>
                                        <button 
                                            className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                                            onClick={() => handleDelete(transaction.id!)}
                                            disabled={loading}
                                            title="Delete transaction"
                                        >
                                            🗑️
                                        </button>
                                        <button 
                                            className={styles.iconBtn}
                                            onClick={() => handleEdit(transaction)}
                                            disabled={loading}
                                            title="Edit transaction"
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

export default TransactionsPage;
