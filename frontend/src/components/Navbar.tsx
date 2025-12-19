import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated, getUserName, logout } from '../utils/auth';
import budgetService from '../services/budgetService';
import { isAdmin } from '../services/adminService';
import logo from '../assets/images/logo.png';
import styles from './Navbar.module.css';

interface BudgetAlert {
    id: number;
    category: string;
    amount: number;
    spent: number;
    percentageUsed: number;
    status: 'warning' | 'exceeded';
}

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

    // Check authentication status
    const checkAuthStatus = () => {
        const loggedIn = isAuthenticated();
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
            setUserName(getUserName());
            setIsAdminUser(isAdmin());
        } else {
            setUserName('');
            setIsAdminUser(false);
        }
    };

    // Check authentication status on component mount
    useEffect(() => {
        checkAuthStatus();
        if (isAuthenticated()) {
            checkBudgetAlerts();
        }
    }, []);

    // Listen for authentication changes
    useEffect(() => {
        const handleAuthChange = () => {
            checkAuthStatus();
            if (isAuthenticated()) {
                checkBudgetAlerts();
            }
        };

        window.addEventListener('storage', handleAuthChange);
        window.addEventListener('authStateChanged', handleAuthChange);
        
        // Listen for budget updates
        window.addEventListener('budgetUpdated', checkBudgetAlerts);
        window.addEventListener('transactionUpdated', checkBudgetAlerts);
        
        return () => {
            window.removeEventListener('storage', handleAuthChange);
            window.removeEventListener('authStateChanged', handleAuthChange);
            window.removeEventListener('budgetUpdated', checkBudgetAlerts);
            window.removeEventListener('transactionUpdated', checkBudgetAlerts);
        };
    }, []);

    const checkBudgetAlerts = async () => {
        try {
            const response = await budgetService.getBudgets();
            const budgets = response.data;
            
            console.log('🔔 Checking budget alerts...');
            console.log('📊 Total budgets:', budgets.length);
            console.log('📋 Budget data:', budgets);
            
            const alerts: BudgetAlert[] = budgets
                .filter(budget => {
                    const spent = budget.spent || 0;
                    const percentageUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                    console.log(`  ${budget.category}: ₹${spent}/₹${budget.amount} = ${percentageUsed.toFixed(1)}%`);
                    return percentageUsed >= 80; // Alert at 80% or more
                })
                .map(budget => {
                    const spent = budget.spent || 0;
                    const percentageUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                    return {
                        id: budget.id!,
                        category: budget.category,
                        amount: budget.amount,
                        spent: spent,
                        percentageUsed: percentageUsed,
                        status: percentageUsed >= 100 ? 'exceeded' : 'warning'
                    };
                });
            
            console.log('⚠️ Alerts found:', alerts.length);
            console.log('🚨 Alert details:', alerts);
            
            setBudgetAlerts(alerts);
            setNotificationCount(alerts.length);
        } catch (error) {
            console.error('Error checking budget alerts:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <nav className={styles.navbar}>
            <Link to="/"><img src={logo} alt="Logo" className={styles.logo} /></Link>
            
            {isLoggedIn ? (
                <div className={styles.userSection}>
                    {/* Navigation Links */}
                    <div className={styles.navLinks}>
                        <Link to="/forum" className={styles.navIconLink} title="Community Forum">
                            💬 Forum
                        </Link>
                        {isAdminUser && (
                            <Link to="/admin" className={styles.navIconLink} title="Admin Portal">
                                ⚙️ Admin
                            </Link>
                        )}
                    </div>

                    {/* Notification Bell */}
                    <div className={styles.notificationContainer}>
                        <button 
                            className={styles.notificationButton}
                            onClick={() => setShowNotifications(!showNotifications)}
                            title="Notifications"
                        >
                            🔔
                            {notificationCount > 0 && (
                                <span className={styles.notificationBadge}>
                                    {notificationCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className={styles.notificationDropdown}>
                                <div className={styles.notificationHeader}>
                                    <h3>Budget Alerts</h3>
                                    <span className={styles.alertCount}>
                                        {notificationCount} {notificationCount === 1 ? 'Alert' : 'Alerts'}
                                    </span>
                                </div>
                                
                                <div className={styles.notificationList}>
                                    {budgetAlerts.length === 0 ? (
                                        <div className={styles.noNotifications}>
                                            <p>✅ All budgets are on track!</p>
                                        </div>
                                    ) : (
                                        budgetAlerts.map(alert => (
                                            <div 
                                                key={alert.id} 
                                                className={`${styles.notificationItem} ${styles[alert.status]}`}
                                                onClick={() => {
                                                    navigate('/budget');
                                                    setShowNotifications(false);
                                                }}
                                            >
                                                <div className={styles.alertIcon}>
                                                    {alert.status === 'exceeded' ? '🚨' : '⚠️'}
                                                </div>
                                                <div className={styles.alertContent}>
                                                    <div className={styles.alertTitle}>
                                                        {alert.category} Budget {alert.status === 'exceeded' ? 'EXCEEDED' : 'Warning'}
                                                    </div>
                                                    <div className={styles.alertDetails}>
                                                        ₹{alert.spent.toFixed(2)} / ₹{alert.amount.toFixed(2)}
                                                    </div>
                                                    <div className={styles.alertPercentage}>
                                                        {alert.percentageUsed.toFixed(1)}% used
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                
                                {budgetAlerts.length > 0 && (
                                    <div className={styles.notificationFooter}>
                                        <button 
                                            className={styles.viewAllButton}
                                            onClick={() => {
                                                navigate('/budget');
                                                setShowNotifications(false);
                                            }}
                                        >
                                            View All Budgets
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Link to="/profile" className={styles.profileLink}>
                        <div className={styles.profilePhoto} title={userName}>
                            {getInitials(userName)}
                        </div>
                    </Link>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        Logout
                    </button>
                </div>
            ) : (
                <div>
                    <Link to="/signup" className={styles.navLink}>Sign Up</Link>
                    <Link to="/signin" className={styles.signInButton}>Sign In</Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;