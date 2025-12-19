import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Area, ComposedChart } from 'recharts';
import transactionService from '../services/transactionService';
import profileService from '../services/profileService';
import type { Transaction } from '../services/transactionService';
import styles from './TransactionsPage.module.css';
import ChatBot from '../components/ChatBot';
import ExpensePredictionChart from '../components/ExpensePredictionChart';

interface CategoryData {
    category: string;
    amount: number;
    percentage: number;
    [key: string]: string | number; // Index signature for recharts compatibility
}

interface MonthlyData {
    month: string;
    income: number;
    expenses: number;
    savings: number;
}

const ReportsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [timeFilter, setTimeFilter] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Colors for pie chart
    const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/signin');
            return;
        }
        loadAnalytics();
    }, [navigate, timeFilter, selectedMonth]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            
            // Load profile to get target expenses
            let profileTargetExpenses = 0;
            try {
                const profileResponse = await profileService.getProfile();
                if (profileResponse.data) {
                    profileTargetExpenses = parseFloat(profileResponse.data.targetExpenses) || 0;
                }
            } catch (err) {
                console.log('No profile data found, using default target expenses = 0');
            }
            
            // Fetch summary from backend
            const summaryResponse = await transactionService.getTransactionSummary();
            const { totalIncome: income, totalExpenses: expenses } = summaryResponse.data;
            
            // Calculate total income = Target Expenses + Income from transactions
            const calculatedIncome = profileTargetExpenses + income;
            setTotalIncome(calculatedIncome);
            setTotalExpenses(expenses);
            setTotalSavings(calculatedIncome - expenses);

            // Fetch transactions for detailed charts
            const response = await transactionService.getUserTransactions();
            let txns = response.data;
            setTransactions(txns);

            // Extract available months from transactions
            const months = new Set<string>();
            txns.forEach((txn: Transaction) => {
                const date = new Date(txn.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                months.add(monthKey);
            });
            const sortedMonths = Array.from(months).sort().reverse();
            setAvailableMonths(sortedMonths);

            // Filter transactions by selected month if applicable
            if (timeFilter === 'monthly' && selectedMonth) {
                txns = txns.filter((txn: Transaction) => {
                    const date = new Date(txn.date);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    return monthKey === selectedMonth;
                });

                // Recalculate summary for selected month
                const monthIncome = txns.filter((t: Transaction) => t.type.toLowerCase() === 'income').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
                const monthExpenses = txns.filter((t: Transaction) => t.type.toLowerCase() === 'expense').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
                const monthCalculatedIncome = profileTargetExpenses + monthIncome;
                
                setTotalIncome(monthCalculatedIncome);
                setTotalExpenses(monthExpenses);
                setTotalSavings(monthCalculatedIncome - monthExpenses);
            }

            // Process data for charts - pass profileTargetExpenses to monthly comparison
            processSpendingByCategory(txns);
            processMonthlyComparison(txns, profileTargetExpenses, timeFilter);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load analytics data');
            console.error('Error loading analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const processSpendingByCategory = (txns: Transaction[]) => {
        const expenseTransactions = txns.filter(t => t.type.toLowerCase() === 'expense');
        const categoryMap = new Map<string, number>();

        expenseTransactions.forEach(txn => {
            const current = categoryMap.get(txn.category) || 0;
            categoryMap.set(txn.category, current + txn.amount);
        });

        const totalExpenses = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

        const data: CategoryData[] = Array.from(categoryMap.entries()).map(([category, amount]) => ({
            category,
            amount,
            percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        }));

        setCategoryData(data.sort((a, b) => b.amount - a.amount));
    };

    const processMonthlyComparison = (txns: Transaction[], targetExpenses: number, filter: 'monthly' | 'yearly') => {
        if (filter === 'yearly') {
            // Yearly aggregation
            const yearMap = new Map<string, { income: number; expenses: number }>();

            txns.forEach(txn => {
                const date = new Date(txn.date);
                const yearKey = `${date.getFullYear()}`;
                
                if (!yearMap.has(yearKey)) {
                    yearMap.set(yearKey, { income: 0, expenses: 0 });
                }

                const yearData = yearMap.get(yearKey)!;
                if (txn.type.toLowerCase() === 'income') {
                    yearData.income += txn.amount;
                } else {
                    yearData.expenses += txn.amount;
                }
            });

            const data: MonthlyData[] = Array.from(yearMap.entries())
                .map(([year, data]) => ({
                    month: year,
                    income: data.income + (targetExpenses * 12), // Add yearly target expenses (monthly * 12)
                    expenses: data.expenses,
                    savings: (data.income + (targetExpenses * 12)) - data.expenses,
                }))
                .sort((a, b) => a.month.localeCompare(b.month))
                .slice(-5); // Last 5 years

            setMonthlyData(data);
        } else {
            // Monthly aggregation
            const monthMap = new Map<string, { income: number; expenses: number }>();

            txns.forEach(txn => {
                const date = new Date(txn.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!monthMap.has(monthKey)) {
                    monthMap.set(monthKey, { income: 0, expenses: 0 });
                }

                const monthData = monthMap.get(monthKey)!;
                if (txn.type.toLowerCase() === 'income') {
                    monthData.income += txn.amount;
                } else {
                    monthData.expenses += txn.amount;
                }
            });

            const data: MonthlyData[] = Array.from(monthMap.entries())
                .map(([month, data]) => ({
                    month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
                    income: data.income + targetExpenses, // Add target expenses to income
                    expenses: data.expenses,
                    savings: (data.income + targetExpenses) - data.expenses, // Calculate savings with target expenses
                }))
                .sort((a, b) => a.month.localeCompare(b.month))
                .slice(-6); // Last 6 months

            setMonthlyData(data);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.transactionsContainer}>
                <div className={styles.header}>
                    <h1>📊 Financial Reports & Analytics</h1>
                </div>

                {/* AI Chatbot */}
                <ChatBot context="reports" />
                
                <div className={styles.filterContainer}>
                    <button 
                        className={`${styles.filterButton} ${timeFilter === 'monthly' ? styles.active : ''}`}
                        onClick={() => {
                            setTimeFilter('monthly');
                            setShowMonthDropdown(!showMonthDropdown);
                        }}
                    >
                        Monthly {timeFilter === 'monthly' && (showMonthDropdown ? '▲' : '▼')}
                    </button>
                    <button 
                        className={`${styles.filterButton} ${timeFilter === 'yearly' ? styles.active : ''}`}
                        onClick={() => {
                            setTimeFilter('yearly');
                            setShowMonthDropdown(false);
                            setSelectedMonth('');
                        }}
                    >
                        Yearly
                    </button>
                </div>

                {/* Month Selection Dropdown */}
                {timeFilter === 'monthly' && showMonthDropdown && availableMonths.length > 0 && (
                    <div className={styles.monthDropdown}>
                        <div className={styles.monthList}>
                            <button
                                className={`${styles.monthItem} ${!selectedMonth ? styles.active : ''}`}
                                onClick={() => {
                                    setSelectedMonth('');
                                    setShowMonthDropdown(false);
                                }}
                            >
                                All Months
                            </button>
                            {availableMonths.map(month => {
                                const date = new Date(month + '-01');
                                const displayMonth = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
                                return (
                                    <button
                                        key={month}
                                        className={`${styles.monthItem} ${selectedMonth === month ? styles.active : ''}`}
                                        onClick={() => {
                                            setSelectedMonth(month);
                                            setShowMonthDropdown(false);
                                        }}
                                    >
                                        {displayMonth}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {error && <div className={styles.error}>{error}</div>}

                {loading ? (
                    <p className={styles.noData}>Loading analytics data...</p>
                ) : transactions.length === 0 ? (
                    <p className={styles.noData}>No transaction data available. Start adding transactions to see analytics!</p>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className={styles.section}>
                            <h2>Financial Summary</h2>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryCard} style={{ borderLeft: '4px solid #34c759' }}>
                                    <div className={styles.summaryLabel}>Total Income</div>
                                    <div className={styles.summaryValue} style={{ color: '#34c759' }}>
                                        ₹{totalIncome.toFixed(2)}
                                    </div>
                                </div>
                                <div className={styles.summaryCard} style={{ borderLeft: '4px solid #ff3b30' }}>
                                    <div className={styles.summaryLabel}>Total Expenses</div>
                                    <div className={styles.summaryValue} style={{ color: '#ff3b30' }}>
                                        ₹{totalExpenses.toFixed(2)}
                                    </div>
                                </div>
                                <div className={styles.summaryCard} style={{ borderLeft: '4px solid #00C49F' }}>
                                    <div className={styles.summaryLabel}>Net Savings</div>
                                    <div className={styles.summaryValue} style={{ color: totalSavings >= 0 ? '#00C49F' : '#ff3b30' }}>
                                        ₹{totalSavings.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pie Chart - Category-wise Spending */}
                        {categoryData.length > 0 && (
                            <div className={styles.section}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1.5rem',
                                    animation: 'slideInFromLeft 0.6s ease-out'
                                }}>
                                    <div>
                                        <h2 style={{ 
                                            fontSize: '1.8rem', 
                                            marginBottom: '0.5rem',
                                            background: 'linear-gradient(135deg, #00C49F, #00D4FF)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 700
                                        }}>
                                            🥧 Category-wise Spending
                                        </h2>
                                        <p style={{ 
                                            color: 'rgba(255, 255, 255, 0.6)', 
                                            fontSize: '0.95rem',
                                            margin: 0
                                        }}>
                                            Visual breakdown of where your money is going
                                        </p>
                                    </div>
                                    <div style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'rgba(0, 196, 159, 0.1)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(0, 196, 159, 0.3)',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        color: '#00C49F'
                                    }}>
                                        Total: ₹{categoryData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                                    </div>
                                </div>
                                <div style={{ 
                                    background: 'linear-gradient(135deg, rgba(0, 196, 159, 0.05) 0%, rgba(0, 136, 254, 0.05) 100%)', 
                                    borderRadius: '20px', 
                                    padding: '2.5rem',
                                    border: '1px solid rgba(137, 250, 255, 0.2)',
                                    boxShadow: '0 8px 32px rgba(0, 196, 159, 0.1)',
                                    animation: 'fadeInUp 0.8s ease-out',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Animated Background Effect */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '300px',
                                        height: '300px',
                                        background: 'radial-gradient(circle, rgba(0, 196, 159, 0.2) 0%, transparent 70%)',
                                        animation: 'pulse 3s ease-in-out infinite',
                                        pointerEvents: 'none'
                                    }} />
                                    <ResponsiveContainer width="100%" height={450}>
                                        <PieChart>
                                            <defs>
                                                <filter id="glowPie">
                                                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur"/>
                                                        <feMergeNode in="SourceGraphic"/>
                                                    </feMerge>
                                                </filter>
                                                <filter id="shadowPie">
                                                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#00C49F" floodOpacity="0.4"/>
                                                </filter>
                                            </defs>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={{
                                                    stroke: 'rgba(255, 255, 255, 0.4)',
                                                    strokeWidth: 2
                                                }}
                                                label={(entry: any) => `${entry.category} (${entry.percentage.toFixed(1)}%)`}
                                                outerRadius={140}
                                                innerRadius={50}
                                                fill="#8884d8"
                                                dataKey="amount"
                                                animationBegin={0}
                                                animationDuration={2500}
                                                animationEasing="ease-out"
                                                paddingAngle={3}
                                            >
                                                {categoryData.map((_entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={COLORS[index % COLORS.length]}
                                                        style={{ 
                                                            cursor: 'pointer',
                                                            filter: 'url(#shadowPie)',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                                                contentStyle={{ 
                                                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
                                                    border: '2px solid rgba(0, 196, 159, 0.5)',
                                                    borderRadius: '15px',
                                                    color: 'white',
                                                    boxShadow: '0 15px 40px rgba(0, 196, 159, 0.4)',
                                                    fontWeight: 600,
                                                    padding: '15px',
                                                    fontSize: '1rem'
                                                }}
                                                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Category Legend */}
                                    <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                        {categoryData.map((item, index) => (
                                            <div key={item.category} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '8px'
                                            }}>
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    borderRadius: '4px',
                                                    background: COLORS[index % COLORS.length]
                                                }} />
                                                <span style={{ flex: 1, fontSize: '0.9rem' }}>{item.category}</span>
                                                <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                                                    ₹{item.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bar Chart - Monthly Spending Comparison */}
                        {monthlyData.length > 0 && (
                            <div className={styles.section}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1.5rem',
                                    animation: 'slideInFromRight 0.6s ease-out'
                                }}>
                                    <div>
                                        <h2 style={{ 
                                            fontSize: '1.8rem', 
                                            marginBottom: '0.5rem',
                                            background: 'linear-gradient(135deg, #0088FE, #00C49F)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 700
                                        }}>
                                            📊 Monthly Comparison
                                        </h2>
                                        <p style={{ 
                                            color: 'rgba(255, 255, 255, 0.6)', 
                                            fontSize: '0.95rem',
                                            margin: 0
                                        }}>
                                            Income vs expenses trend over time
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(52, 199, 89, 0.1)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(52, 199, 89, 0.3)',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            color: '#34c759'
                                        }}>
                                            ● Income
                                        </div>
                                        <div style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(255, 59, 48, 0.1)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255, 59, 48, 0.3)',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            color: '#ff3b30'
                                        }}>
                                            ● Expenses
                                        </div>
                                    </div>
                                </div>
                                <div style={{ 
                                    background: 'linear-gradient(135deg, rgba(0, 136, 254, 0.05) 0%, rgba(255, 59, 48, 0.05) 100%)', 
                                    borderRadius: '20px', 
                                    padding: '2.5rem',
                                    border: '1px solid rgba(137, 250, 255, 0.2)',
                                    boxShadow: '0 8px 32px rgba(0, 136, 254, 0.1)',
                                    animation: 'fadeInUp 1s ease-out',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Animated Background Effect */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '600px',
                                        height: '400px',
                                        background: 'radial-gradient(ellipse, rgba(0, 136, 254, 0.15) 0%, transparent 70%)',
                                        animation: 'pulse 3s ease-in-out infinite',
                                        pointerEvents: 'none'
                                    }} />
                                    <ResponsiveContainer width="100%" height={450}>
                                        <ComposedChart 
                                            data={monthlyData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#34c759" stopOpacity={0.9}/>
                                                    <stop offset="95%" stopColor="#34c759" stopOpacity={0.6}/>
                                                </linearGradient>
                                                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.9}/>
                                                    <stop offset="95%" stopColor="#ff3b30" stopOpacity={0.6}/>
                                                </linearGradient>
                                                <linearGradient id="areaIncome" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#34c759" stopOpacity={0.3}/>
                                                    <stop offset="50%" stopColor="#34c759" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#34c759" stopOpacity={0.05}/>
                                                </linearGradient>
                                                <linearGradient id="areaExpenses" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.3}/>
                                                    <stop offset="50%" stopColor="#ff3b30" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#ff3b30" stopOpacity={0.05}/>
                                                </linearGradient>
                                                <filter id="glowBar">
                                                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur"/>
                                                        <feMergeNode in="SourceGraphic"/>
                                                    </feMerge>
                                                </filter>
                                                <filter id="shadowBar">
                                                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#0088FE" floodOpacity="0.3"/>
                                                </filter>
                                            </defs>
                                            <CartesianGrid 
                                                strokeDasharray="3 3" 
                                                stroke="#00C49F"
                                                vertical={false}
                                                strokeWidth={1}
                                                opacity={0.2}
                                            />
                                            <XAxis 
                                                dataKey="month" 
                                                stroke="#00C49F"
                                                style={{ fontSize: '0.9rem', fontWeight: 700, fill: '#00C49F' }}
                                                tickLine={false}
                                            />
                                            <YAxis 
                                                stroke="#00C49F"
                                                style={{ fontSize: '0.9rem', fontWeight: 700, fill: '#00C49F' }}
                                                tickFormatter={(value) => `₹${value}`}
                                                tickLine={false}
                                            />
                                            <Tooltip 
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        const seenKeys = new Set();
                                                        const uniquePayload = payload.filter(item => {
                                                            if (seenKeys.has(item.dataKey)) {
                                                                return false;
                                                            }
                                                            seenKeys.add(item.dataKey);
                                                            return true;
                                                        });
                                                        
                                                        return (
                                                            <div style={{
                                                                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                                                border: '2px solid #00C49F',
                                                                borderRadius: '15px',
                                                                color: 'white',
                                                                boxShadow: '0 15px 40px rgba(0, 196, 159, 0.4)',
                                                                fontWeight: 600,
                                                                padding: '15px',
                                                                fontSize: '1rem'
                                                            }}>
                                                                <p style={{ margin: '0 0 8px 0', fontWeight: 700 }}>{label}</p>
                                                                {uniquePayload.map((entry, index) => (
                                                                    <p key={index} style={{ margin: '4px 0', color: entry.color }}>
                                                                        {entry.name}: ₹{Number(entry.value).toFixed(2)}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                            />
                                            <Legend 
                                                wrapperStyle={{ color: 'white', fontWeight: 600, paddingTop: '20px' }}
                                                iconType="diamond"
                                                iconSize={16}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="income"
                                                fill="url(#areaIncome)"
                                                stroke="none"
                                                animationDuration={2500}
                                                animationBegin={0}
                                                animationEasing="ease-out"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="expenses"
                                                fill="url(#areaExpenses)"
                                                stroke="none"
                                                animationDuration={2500}
                                                animationBegin={200}
                                                animationEasing="ease-out"
                                            />
                                            <Bar 
                                                dataKey="income" 
                                                fill="url(#colorIncome)" 
                                                name="Income"
                                                radius={[10, 10, 0, 0]}
                                                animationDuration={2500}
                                                animationBegin={400}
                                                animationEasing="ease-out"
                                                style={{ filter: 'url(#shadowBar)' }}
                                            />
                                            <Bar 
                                                dataKey="expenses" 
                                                fill="url(#colorExpenses)" 
                                                name="Expenses"
                                                radius={[10, 10, 0, 0]}
                                                animationDuration={2500}
                                                animationBegin={600}
                                                animationEasing="ease-out"
                                                style={{ filter: 'url(#shadowBar)' }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Line Chart - Monthly Savings Trend */}
                        {monthlyData.length > 0 && (
                            <div className={styles.section}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1.5rem',
                                    animation: 'slideInFromLeft 0.6s ease-out'
                                }}>
                                    <div>
                                        <h2 style={{ 
                                            fontSize: '1.8rem', 
                                            marginBottom: '0.5rem',
                                            background: 'linear-gradient(135deg, #00C49F, #34c759)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 700
                                        }}>
                                            📈 Savings Growth Trend
                                        </h2>
                                        <p style={{ 
                                            color: 'rgba(255, 255, 255, 0.6)', 
                                            fontSize: '0.95rem',
                                            margin: 0
                                        }}>
                                            Track your financial progress over time
                                        </p>
                                    </div>
                                    <div style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'rgba(0, 196, 159, 0.15)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(0, 196, 159, 0.4)',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        color: '#00C49F',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{ fontSize: '1.2rem' }}>📊</span>
                                        Last {monthlyData.length} Months
                                    </div>
                                </div>
                                <div style={{ 
                                    background: 'linear-gradient(135deg, rgba(0, 196, 159, 0.05) 0%, rgba(52, 199, 89, 0.05) 100%)', 
                                    borderRadius: '20px', 
                                    padding: '2.5rem',
                                    border: '1px solid rgba(137, 250, 255, 0.2)',
                                    boxShadow: '0 8px 32px rgba(0, 196, 159, 0.15)',
                                    animation: 'fadeInUp 1.2s ease-out',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Animated Background Effect */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'radial-gradient(circle at 50% 50%, rgba(0, 196, 159, 0.1) 0%, transparent 70%)',
                                        animation: 'pulse 3s ease-in-out infinite',
                                        pointerEvents: 'none'
                                    }} />
                                    
                                    <ResponsiveContainer width="100%" height={450}>
                                        <ComposedChart 
                                            data={monthlyData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                        >
                                            <defs>
                                                {/* Main Area Gradient */}
                                                <linearGradient id="colorSavingsArea" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#00C49F" stopOpacity={0.6}/>
                                                    <stop offset="50%" stopColor="#34c759" stopOpacity={0.3}/>
                                                    <stop offset="100%" stopColor="#00C49F" stopOpacity={0.05}/>
                                                </linearGradient>
                                                
                                                {/* Glow Effect */}
                                                <filter id="glow">
                                                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur"/>
                                                        <feMergeNode in="SourceGraphic"/>
                                                    </feMerge>
                                                </filter>
                                                
                                                {/* Shadow Effect */}
                                                <filter id="shadowEffect" x="-50%" y="-50%" width="200%" height="200%">
                                                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#00C49F" floodOpacity="0.6"/>
                                                </filter>
                                            </defs>
                                            
                                            <CartesianGrid 
                                                strokeDasharray="5 5" 
                                                stroke="rgba(0, 196, 159, 0.15)" 
                                                vertical={false}
                                                strokeWidth={1}
                                            />
                                            
                                            <XAxis 
                                                dataKey="month" 
                                                stroke="rgba(255, 255, 255, 0.7)"
                                                style={{ 
                                                    fontSize: '0.9rem', 
                                                    fontWeight: 700,
                                                    fill: '#00C49F'
                                                }}
                                                tickLine={false}
                                                axisLine={{ stroke: 'rgba(0, 196, 159, 0.3)', strokeWidth: 2 }}
                                            />
                                            
                                            <YAxis 
                                                stroke="rgba(255, 255, 255, 0.7)"
                                                style={{ 
                                                    fontSize: '0.9rem', 
                                                    fontWeight: 700,
                                                    fill: '#00C49F'
                                                }}
                                                tickFormatter={(value) => `₹${value}`}
                                                tickLine={false}
                                                axisLine={{ stroke: 'rgba(0, 196, 159, 0.3)', strokeWidth: 2 }}
                                            />
                                            
                                            <Tooltip 
                                                formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Savings']}
                                                contentStyle={{ 
                                                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)', 
                                                    border: '2px solid #00C49F',
                                                    borderRadius: '15px',
                                                    color: 'white',
                                                    boxShadow: '0 10px 40px rgba(0, 196, 159, 0.5), 0 0 20px rgba(0, 196, 159, 0.3)',
                                                    fontWeight: 700,
                                                    padding: '15px 20px',
                                                    fontSize: '1rem'
                                                }}
                                                cursor={{ 
                                                    stroke: 'rgba(0, 196, 159, 0.5)', 
                                                    strokeWidth: 3,
                                                    strokeDasharray: '5 5'
                                                }}
                                            />
                                            
                                            <Legend 
                                                wrapperStyle={{ 
                                                    color: 'white', 
                                                    fontWeight: 700, 
                                                    paddingTop: '25px',
                                                    fontSize: '1rem'
                                                }} 
                                                iconType="diamond"
                                                iconSize={16}
                                            />
                                            
                                            {/* Area Chart with Gradient Fill */}
                                            <Area 
                                                type="monotone"
                                                dataKey="savings"
                                                fill="url(#colorSavingsArea)"
                                                stroke="none"
                                                animationDuration={2500}
                                                animationBegin={0}
                                                animationEasing="ease-out"
                                            />
                                            
                                            {/* Main Line with Glow */}
                                            <Line 
                                                type="monotone" 
                                                dataKey="savings" 
                                                stroke="#00C49F" 
                                                strokeWidth={5}
                                                name="Monthly Savings"
                                                dot={{ 
                                                    fill: '#00C49F', 
                                                    r: 7, 
                                                    strokeWidth: 4, 
                                                    stroke: '#ffffff',
                                                    filter: 'url(#shadowEffect)'
                                                }}
                                                activeDot={{ 
                                                    r: 10, 
                                                    fill: '#00C49F',
                                                    stroke: '#ffffff',
                                                    strokeWidth: 4,
                                                    filter: 'url(#glow)',
                                                    style: {
                                                        cursor: 'pointer',
                                                        animation: 'pulse 1s ease-in-out infinite'
                                                    }
                                                }}
                                                animationDuration={2500}
                                                animationBegin={200}
                                                animationEasing="ease-in-out"
                                                filter="url(#glow)"
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* AI Expense Prediction Chart */}
                        <ExpensePredictionChart />
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;