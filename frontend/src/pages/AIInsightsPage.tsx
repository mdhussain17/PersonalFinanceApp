import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import aiService from '../services/aiService';
import styles from './AIInsightsPage.module.css';

const AIInsightsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [insights, setInsights] = useState<string>('');
    const [forecast, setForecast] = useState<string>('');
    
    const [showInsights, setShowInsights] = useState(false);
    const [showForecast, setShowForecast] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/signin');
            return;
        }
    }, [navigate]);

    const handleGetInsights = async () => {
        setLoading(true);
        setError('');
        setShowInsights(false);
        
        try {
            const response = await aiService.getAIInsights();
            setInsights(response.insights);
            setShowInsights(true);
        } catch (err: any) {
            console.error('Error fetching AI insights:', err);
            setError(err.response?.data?.message || 'Failed to get AI insights. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGetForecast = async () => {
        setLoading(true);
        setError('');
        setShowForecast(false);
        
        try {
            const response = await aiService.getAIForecast();
            setForecast(response.forecast);
            setShowForecast(true);
        } catch (err: any) {
            console.error('Error fetching AI forecast:', err);
            setError(err.response?.data?.message || 'Failed to get AI forecast. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <div className={styles.header}>
                    <h1>🤖 AI Financial Advisor</h1>
                    <p className={styles.subtitle}>
                        Get personalized insights, predictions, and tips powered by Google Gemini AI
                    </p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.featuresGrid}>
                    {/* Monthly Insights Card */}
                    <div className={styles.featureCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>
                                <span className={styles.icon}>💡</span>
                            </div>
                            <h2>Monthly Insights & Saving Tips</h2>
                        </div>
                        <p className={styles.cardDescription}>
                            Get AI-powered analysis of your spending patterns, income-to-expense ratio, 
                            and personalized saving tips based on your current financial data.
                        </p>
                        <button 
                            className={styles.primaryButton}
                            onClick={handleGetInsights}
                            disabled={loading}
                        >
                            {loading && !showInsights ? '🔄 Analyzing...' : '✨ Get Insights'}
                        </button>

                        {showInsights && insights && (
                            <div className={styles.resultBox}>
                                <h3>📊 Your Financial Insights:</h3>
                                <div className={styles.aiResponse}>
                                    {insights.split('\n').map((line, index) => (
                                        line.trim() && <p key={index}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Forecast & Alerts Card */}
                    <div className={styles.featureCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>
                                <span className={styles.icon}>🔮</span>
                            </div>
                            <h2>Spending Forecast & Alerts</h2>
                        </div>
                        <p className={styles.cardDescription}>
                            Predict next month's expenses based on your transaction history and 
                            get alerts about unusual spending patterns or anomalies.
                        </p>
                        <button 
                            className={styles.primaryButton}
                            onClick={handleGetForecast}
                            disabled={loading}
                        >
                            {loading && !showForecast ? '🔄 Predicting...' : '🔮 Get Forecast'}
                        </button>

                        {showForecast && forecast && (
                            <div className={styles.resultBox}>
                                <h3>📈 Your Spending Forecast:</h3>
                                <div className={styles.aiResponse}>
                                    {forecast.split('\n').map((line, index) => (
                                        line.trim() && <p key={index}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className={styles.infoSection}>
                    <h3>🎯 How It Works</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <span className={styles.infoIcon}>🧠</span>
                            <h4>Smart Analysis</h4>
                            <p>Google Gemini AI analyzes your financial data using advanced machine learning</p>
                        </div>
                        <div className={styles.infoCard}>
                            <span className={styles.infoIcon}>🔒</span>
                            <h4>Privacy First</h4>
                            <p>Your data is processed securely and never stored by the AI service</p>
                        </div>
                        <div className={styles.infoCard}>
                            <span className={styles.infoIcon}>⚡</span>
                            <h4>Real-time Insights</h4>
                            <p>Get instant, personalized recommendations based on your latest transactions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInsightsPage;
