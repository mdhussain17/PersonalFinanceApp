import React, { useEffect, useState } from 'react';
import aiService, { type ExpensePredictionDto } from '../services/aiService';
import styles from './ExpensePredictionChart.module.css';

const ExpensePredictionChart: React.FC = () => {
    const [predictionData, setPredictionData] = useState<ExpensePredictionDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [aiMessage, setAiMessage] = useState('');

    useEffect(() => {
        loadPrediction();
    }, []);

    const loadPrediction = async () => {
        try {
            setLoading(true);
            setError('');
            
            const data = await aiService.getExpensePrediction();
            setPredictionData(data);
            
            // Get AI chat message about prediction
            try {
                const message = await aiService.getNextMonthPredictionChat();
                setAiMessage(message);
            } catch (chatErr) {
                console.warn('AI chat message failed, continuing without it:', chatErr);
                // Continue even if chat message fails
            }
        } catch (err: any) {
            console.error('Error loading prediction:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load expense prediction');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>📊 Loading prediction...</div>
            </div>
        );
    }

    if (error || !predictionData) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>⚠️ {error || 'No prediction data available'}</div>
            </div>
        );
    }

    // Check if we have valid data arrays
    if (!predictionData.historicalData || !predictionData.predictedData ||
        predictionData.historicalData.length === 0 || predictionData.predictedData.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>⚠️ Not enough transaction data to generate predictions. Start adding expenses for this month to see AI predictions!</div>
            </div>
        );
    }
    
    // Check if all historical values are zero
    const hasRealData = predictionData.historicalData.some(d => d.value > 0);
    if (!hasRealData) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>⚠️ No expenses recorded yet. Add some transactions this month to see next month's prediction!</div>
            </div>
        );
    }

    // Calculate max value for scaling
    const allValues = [
        ...predictionData.historicalData.map(d => d.value),
        ...predictionData.predictedData.map(d => d.value)
    ];
    const maxValue = Math.max(...allValues, 1); // Ensure at least 1 to prevent division by zero
    const minValue = Math.min(...allValues, 0);
    
    // Safe height calculation to prevent NaN
    const calculateHeightPercent = (value: number): number => {
        const range = maxValue - minValue;
        if (range === 0) return 50; // If all values are the same, show 50% height
        return ((value - minValue) / range) * 100;
    };
    
    // Get the next month's predicted value (last item in predictedData)
    const nextMonthPrediction = predictionData.predictedData[predictionData.predictedData.length - 1];    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>📈 Expense Prediction</h2>
                <p className={styles.subtitle}>AI-powered forecast based on your spending trends</p>
            </div>

            {/* AI Message */}
            {aiMessage && (
                <div className={styles.aiMessage}>
                    <span className={styles.aiIcon}>🤖</span>
                    <p>{aiMessage}</p>
                </div>
            )}

            {/* Chart Container */}
            <div className={styles.chartContainer}>
                <div className={styles.chart}>
                    {/* Y-axis labels */}
                    <div className={styles.yAxis}>
                        <span className={styles.yLabel}>₹{maxValue.toFixed(0)}</span>
                        <span className={styles.yLabel}>₹{((maxValue + minValue) / 2).toFixed(0)}</span>
                        <span className={styles.yLabel}>₹{minValue.toFixed(0)}</span>
                    </div>

                    {/* Bars */}
                    <div className={styles.barsContainer}>
                        {/* Historical bars */}
                        {predictionData.historicalData.map((point, index) => {
                            const heightPercent = calculateHeightPercent(point.value);
                            return (
                                <div key={`hist-${index}`} className={styles.barWrapper}>
                                    <div className={styles.barContainer}>
                                        <div 
                                            className={styles.barHistorical}
                                            style={{ height: `${heightPercent}%` }}
                                            title={`${point.label}: ₹${point.value.toFixed(2)}`}
                                        >
                                            <span className={styles.barValue}>₹{point.value.toFixed(0)}</span>
                                        </div>
                                    </div>
                                    <span className={styles.barLabel}>{point.label}</span>
                                </div>
                            );
                        })}

                        {/* Predicted bar (next month) */}
                        {nextMonthPrediction && (
                            <div className={styles.barWrapper}>
                                <div className={styles.barContainer}>
                                    <div 
                                        className={styles.barPredicted}
                                        style={{ 
                                            height: `${calculateHeightPercent(nextMonthPrediction.value)}%` 
                                        }}
                                        title={`${nextMonthPrediction.label} (Predicted): ₹${nextMonthPrediction.value.toFixed(2)}`}
                                    >
                                        <span className={styles.barValue}>₹{nextMonthPrediction.value.toFixed(0)}</span>
                                    </div>
                                </div>
                                <span className={styles.barLabel}>{nextMonthPrediction.label} ⭐</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <span className={styles.legendColorHistorical}></span>
                    <span>Historical Data</span>
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.legendColorPredicted}></span>
                    <span>AI Prediction</span>
                </div>
            </div>

            {/* Stats Summary */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Next Month Prediction</span>
                    <span className={styles.statValue}>₹{nextMonthPrediction.value.toFixed(2)}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>
                        {predictionData.historicalData.length === 1 ? 'This Month' : `Avg Last ${predictionData.historicalData.length} Months`}
                    </span>
                    <span className={styles.statValue}>
                        ₹{(predictionData.historicalData.reduce((sum, d) => sum + d.value, 0) / predictionData.historicalData.length).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ExpensePredictionChart;
