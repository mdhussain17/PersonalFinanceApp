import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import savingsGoalService from '../services/savingsGoalService';
import type { SavingsGoal } from '../services/savingsGoalService';
import styles from './TransactionsPage.module.css';
import ChatBot from '../components/ChatBot';

const SavingsGoalsPage: React.FC = () => {
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState<SavingsGoal>({
        goalName: '',
        goalType: 'Personal',
        targetAmount: 0,
        currentAmount: 0,  // This will be ignored by backend (calculated automatically)
        deadline: '',
    });

    // Custom goal type state
    const [showCustomGoalType, setShowCustomGoalType] = useState(false);
    const [customGoalType, setCustomGoalType] = useState('');

    // Goal types
    const goalTypes = [
        'Personal',
        'Emergency Fund',
        'Vacation',
        'Education',
        'House/Property',
        'Vehicle',
        'Wedding',
        'Retirement',
        'Investment',
        'Other'
    ];

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/signin');
            return;
        }
        loadGoals();
    }, [navigate]);

    const loadGoals = async () => {
        try {
            setLoading(true);
            const response = await savingsGoalService.getSavingsGoals();
            setGoals(response.data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load savings goals');
            console.error('Error loading goals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        console.log('🚀 Submitting goal - EditingId:', editingId, 'FormData:', formData);

        if (!formData.goalName || formData.targetAmount <= 0) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            if (editingId) {
                console.log('📝 Updating goal with ID:', editingId);
                const response = await savingsGoalService.updateSavingsGoal(editingId, formData);
                console.log('✅ Update response:', response.data);
                setSuccess('Goal updated successfully!');
            } else {
                console.log('➕ Creating new goal');
                const response = await savingsGoalService.createSavingsGoal(formData);
                console.log('✅ Create response:', response.data);
                setSuccess('Goal created successfully!');
            }
            
            resetForm();
            loadGoals();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('❌ Error saving goal:', err);
            console.error('❌ Response:', err.response);
            setError(err.response?.data?.message || 'Failed to save goal');
        }
    };

    const handleEdit = (goal: SavingsGoal) => {
        console.log('✏️ Editing goal:', goal);
        
        // Check if the goal type is a custom one (not in predefined list)
        const isCustomType = goal.goalType && !goalTypes.includes(goal.goalType);
        
        setFormData({
            id: goal.id,  // ← Include the ID
            goalName: goal.goalName,
            goalType: goal.goalType || 'Personal',
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            deadline: goal.deadline || '',
        });
        
        // If custom type, show the custom input
        if (isCustomType) {
            setShowCustomGoalType(true);
            setCustomGoalType(goal.goalType || '');
        } else {
            setShowCustomGoalType(false);
            setCustomGoalType('');
        }
        
        setEditingId(goal.id!);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this goal?')) {
            return;
        }

        try {
            await savingsGoalService.deleteSavingsGoal(id);
            setSuccess('Goal deleted successfully!');
            loadGoals();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete goal');
            console.error('Error deleting goal:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            goalName: '',
            goalType: 'Personal',
            targetAmount: 0,
            currentAmount: 0,
            deadline: '',
        });
        setEditingId(null);
        setIsEditing(false);
        setShowCustomGoalType(false);
        setCustomGoalType('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'targetAmount' || name === 'currentAmount') 
                ? parseFloat(value) || 0 
                : value
        }));
    };

    const calculateProgress = (goal: SavingsGoal) => {
        if (goal.targetAmount === 0) return '0.0';
        return ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1);
    };

    const handleAddContribution = (goalName: string) => {
        // Navigate to transactions page with pre-filled data
        // Type: 'savings' (new type)
        // Category: goalName (must match exactly)
        navigate('/transactions', { 
            state: { 
                type: 'savings',
                category: goalName  // Just the goal name, not "Savings - goalName"
            } 
        });
    };
    return (
        <div className={styles.pageContainer}>
            <div className={styles.transactionsContainer}>
                <div className={styles.header}>
                    <h1>Savings Goals</h1>
                </div>

                {/* AI Chatbot */}
                <ChatBot 
                    context="savings" 
                    availableGoals={goals.map(g => ({ id: g.id!, goalName: g.goalName }))}
                />

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}
                {success && <div className={styles.success}>{success}</div>}

                {/* Savings Goals Overview Summary */}
                {!loading && goals.length > 0 && (
                    <div className={styles.section}>
                        <h2>Savings Goals Overview</h2>
                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryCard} style={{ borderLeft: '4px solid var(--primary-color)' }}>
                                <div className={styles.summaryLabel}>Total Target</div>
                                <div className={styles.summaryValue} style={{ color: 'var(--primary-color)' }}>
                                    ₹{goals.reduce((sum, g) => sum + g.targetAmount, 0).toFixed(2)}
                                </div>
                            </div>
                            <div className={styles.summaryCard} style={{ borderLeft: '4px solid #34c759' }}>
                                <div className={styles.summaryLabel}>Current Savings</div>
                                <div className={styles.summaryValue} style={{ color: '#34c759' }}>
                                    ₹{goals.reduce((sum, g) => sum + g.currentAmount, 0).toFixed(2)}
                                </div>
                            </div>
                            <div className={styles.summaryCard} style={{ borderLeft: '4px solid #ff9500' }}>
                                <div className={styles.summaryLabel}>Remaining to Save</div>
                                <div className={styles.summaryValue} style={{ 
                                    color: goals.reduce((sum, g) => sum + (g.targetAmount - g.currentAmount), 0) >= 0 ? '#ff9500' : '#34c759'
                                }}>
                                    ₹{goals.reduce((sum, g) => sum + (g.targetAmount - g.currentAmount), 0).toFixed(2)}
                                </div>
                            </div>
                            <div className={styles.summaryCard} style={{ borderLeft: '4px solid #00C49F' }}>
                                <div className={styles.summaryLabel}>Overall Progress</div>
                                <div className={styles.summaryValue} style={{ color: '#00C49F' }}>
                                    {goals.reduce((sum, g) => sum + g.targetAmount, 0) > 0 
                                        ? ((goals.reduce((sum, g) => sum + g.currentAmount, 0) / goals.reduce((sum, g) => sum + g.targetAmount, 0)) * 100).toFixed(1)
                                        : 0}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Goals Form */}
                {isEditing && (
                    <div className={styles.formSection}>
                        <div className={styles.formHeader}>
                            <h2>{editingId ? 'Edit Savings Goal' : 'Create New Goal'}</h2>
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
                                    <label>Goal Name *</label>
                                    <input
                                        type="text"
                                        name="goalName"
                                        value={formData.goalName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Emergency Fund, Vacation"
                                        required
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Goal Type *</label>
                                    <select
                                        name="goalType"
                                        value={formData.goalType}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === 'Other') {
                                                setShowCustomGoalType(true);
                                                setCustomGoalType('');
                                                setFormData(prev => ({ ...prev, goalType: '' }));
                                            } else {
                                                setShowCustomGoalType(false);
                                                setFormData(prev => ({ ...prev, goalType: value }));
                                            }
                                        }}
                                        required
                                        className={styles.select}
                                    >
                                        {goalTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Custom Goal Type Input */}
                                {showCustomGoalType && (
                                    <div className={styles.formGroup}>
                                        <label>Custom Goal Type *</label>
                                        <input
                                            type="text"
                                            placeholder="Enter custom goal type (e.g., Charity, Hobbies)"
                                            value={customGoalType}
                                            onChange={(e) => {
                                                setCustomGoalType(e.target.value);
                                                setFormData(prev => ({ ...prev, goalType: e.target.value }));
                                            }}
                                            required
                                            className={styles.input}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Target Amount (₹) *</label>
                                    <input
                                        type="number"
                                        name="targetAmount"
                                        value={formData.targetAmount}
                                        onChange={handleInputChange}
                                        onFocus={() => {
                                            if (formData.targetAmount === 0) {
                                                setFormData(prev => ({ ...prev, targetAmount: '' as any }));
                                            }
                                        }}
                                        onBlur={() => {
                                            if (!formData.targetAmount || formData.targetAmount === 0) {
                                                setFormData(prev => ({ ...prev, targetAmount: 0 }));
                                            }
                                        }}
                                        min="0"
                                        step="0.01"
                                        required
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Deadline (Optional)</label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            {/* Info message about contributions */}
                            <div className={styles.formGroup} style={{ 
                                fontSize: '0.875rem', 
                                color: '#666', 
                                marginTop: '-0.5rem',
                                padding: '0.75rem',
                                background: 'rgba(0, 196, 159, 0.1)',
                                borderRadius: '8px',
                                borderLeft: '3px solid #00C49F'
                            }}>
                                💡 <strong>Tip:</strong> Current savings are automatically calculated from your income transactions. 
                                After creating this goal, use the "Add Contribution" button to record savings.
                            </div>

                            <div className={styles.buttonGroup}>
                                <button type="submit" className={styles.cancelButton} disabled={loading}>
                                    {loading ? 'Saving...' : (editingId ? 'Update Goal' : 'Create Goal')}
                                </button>
                                <button type="button" className={styles.cancelButton} onClick={resetForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Goals List */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>My Savings Goals</h2>
                        {!isEditing && (
                            <button 
                                className={styles.addTransactionBtn}
                                onClick={() => setIsEditing(true)}
                            >
                                + Add Goal
                            </button>
                        )}
                    </div>

                    {loading && <p className={styles.noData}>Loading goals...</p>}

                    {!loading && goals.length === 0 && (
                        <p className={styles.noData}>No savings goals yet. Click "Add Goal" to get started!</p>
                    )}

                    {!loading && goals.length > 0 && (
                        <div className={styles.transactionsList}>
                            {goals.map((goal) => {
                                const progress = parseFloat(calculateProgress(goal));
                                const isComplete = progress >= 100;
                                const remaining = goal.remainingAmount ?? (goal.targetAmount - goal.currentAmount);

                                return (
                                    <div 
                                        key={goal.id} 
                                        className={`${styles.transactionCard}`}
                                        style={{
                                            borderLeft: isComplete 
                                                ? '4px solid #34c759' 
                                                : '4px solid #00C49F'
                                        }}
                                    >
                                        <div className={styles.transactionMain}>
                                            <div className={styles.transactionDetails}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <h3>🎯 {goal.goalName}</h3>
                                                    <span style={{ 
                                                        fontSize: '0.85rem', 
                                                        fontWeight: 600,
                                                        color: isComplete ? '#34c759' : '#00C49F',
                                                        padding: '0.25rem 0.75rem',
                                                        background: isComplete ? '#34c75920' : '#00C49F20',
                                                        borderRadius: '12px'
                                                    }}>
                                                        {isComplete ? '✅ Achieved!' : `${progress}% Complete`}
                                                    </span>
                                                </div>
                                                
                                                <div className={styles.transactionMeta}>
                                                    <span className={styles.category}>
                                                        � {goal.goalType || 'Personal'}
                                                    </span>
                                                    {goal.deadline && (
                                                        <span className={styles.date}>
                                                            📅 Target: {new Date(goal.deadline).toLocaleDateString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Progress Overview */}
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
                                                            TARGET
                                                        </div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                                                            ₹{goal.targetAmount.toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '0.25rem' }}>
                                                            SAVED
                                                        </div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#34c759' }}>
                                                            ₹{goal.currentAmount.toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '0.25rem' }}>
                                                            REMAINING
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: '1.1rem', 
                                                            fontWeight: 600, 
                                                            color: remaining > 0 ? '#ff9500' : '#34c759'
                                                        }}>
                                                            ₹{remaining.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div style={{ marginTop: '1rem' }}>
                                                    <div style={{
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '10px',
                                                        height: '12px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            width: `${Math.min(progress, 100)}%`,
                                                            height: '100%',
                                                            background: isComplete 
                                                                ? 'linear-gradient(90deg, #34c759, #30d158)' 
                                                                : 'linear-gradient(90deg, #00C49F, #00D4AA)',
                                                            transition: 'width 0.5s ease',
                                                            borderRadius: '10px'
                                                        }} />
                                                    </div>
                                                </div>

                                                {/* Add Contribution Button */}
                                                {!isComplete && (
                                                    <button
                                                        onClick={() => handleAddContribution(goal.goalName)}
                                                        style={{
                                                            marginTop: '1rem',
                                                            padding: '0.6rem 1rem',
                                                            background: 'linear-gradient(135deg, #00C49F, #00D4AA)',
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
                                                        💰 Add Contribution to {goal.goalName}
                                                    </button>
                                                )}

                                                {isComplete && (
                                                    <div style={{
                                                        marginTop: '1rem',
                                                        padding: '0.75rem',
                                                        background: 'rgba(52, 199, 89, 0.1)',
                                                        borderRadius: '8px',
                                                        textAlign: 'center',
                                                        color: '#34c759',
                                                        fontWeight: 600
                                                    }}>
                                                        🎉 Congratulations! Goal achieved!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.transactionIconActions}>
                                            <button 
                                                className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                                                onClick={() => handleDelete(goal.id!)}
                                                disabled={loading}
                                                title="Delete goal"
                                            >
                                                🗑️
                                            </button>
                                            <button 
                                                className={styles.iconBtn}
                                                onClick={() => handleEdit(goal)}
                                                disabled={loading}
                                                title="Edit goal"
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

export default SavingsGoalsPage;
