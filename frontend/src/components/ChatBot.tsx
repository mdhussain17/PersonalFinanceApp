import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatBot.module.css';
import * as aiService from '../services/aiService';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface ChatBotProps {
    context: 'reports' | 'savings' | 'budget';
    availableGoals?: { id: number; goalName: string }[];
}

const ChatBot: React.FC<ChatBotProps> = ({ context, availableGoals = [] }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (text: string, sender: 'user' | 'ai') => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            sender,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const handleQuickOption = async (optionType: string) => {
        setLoading(true);
        let response = '';

        try {
            switch (optionType) {
                case 'monthly-insights':
                    addMessage('Show me monthly insights', 'user');
                    const insights = await aiService.getAIInsights();
                    response = insights.insights;
                    break;

                case 'forecast':
                    addMessage('What is the forecast for next month?', 'user');
                    const forecast = await aiService.getAIForecast();
                    response = forecast.forecast;
                    break;

                case 'categorization':
                    addMessage('Help me categorize my transactions', 'user');
                    response = 'I can help you categorize transactions! Please go to the Transactions page and add a new transaction. I\'ll automatically suggest the best category based on your description.';
                    break;

                case 'breakdown':
                    addMessage('Show me my spending breakdown', 'user');
                    response = await aiService.getSpendingBreakdown();
                    break;

                case 'personalized-insights':
                    addMessage('Give me personalized financial insights', 'user');
                    response = await aiService.getPersonalizedInsights();
                    break;

                case 'transaction-details':
                    addMessage('Analyze my transaction details', 'user');
                    response = await aiService.getTransactionDetails();
                    break;

                case 'saving-tips':
                    if (!selectedGoalId) {
                        response = 'Please select a savings goal first to get personalized tips!';
                    } else {
                        const goal = availableGoals.find(g => g.id === selectedGoalId);
                        addMessage(`Give me saving tips for ${goal?.goalName}`, 'user');
                        response = await aiService.getSavingTips(selectedGoalId);
                    }
                    break;

                case 'goal-tracking':
                    addMessage('How are my savings goals progressing?', 'user');
                    response = await aiService.getGoalTracking();
                    break;

                default:
                    response = 'Sorry, I didn\'t understand that option.';
            }

            addMessage(response, 'ai');
        } catch (error: any) {
            console.error('Error getting AI response:', error);
            addMessage('Sorry, I encountered an error. Please try again later.', 'ai');
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || loading) return;

        const question = inputValue.trim();
        setInputValue('');
        addMessage(question, 'user');
        setLoading(true);

        try {
            const response = await aiService.sendChatMessage(question);
            addMessage(response, 'ai');
        } catch (error: any) {
            console.error('Error sending message:', error);
            addMessage('Sorry, I encountered an error. Please try again later.', 'ai');
        } finally {
            setLoading(false);
        }
    };

    const reportsOptions: Array<{ id: string; label: string; icon: string; requiresGoal?: boolean }> = [
        { id: 'monthly-insights', label: 'Monthly Insights', icon: '📊' },
        { id: 'forecast', label: 'Forecast Next Month', icon: '🔮' },
        { id: 'breakdown', label: 'Spending Breakdown', icon: '💰' },
        { id: 'transaction-details', label: 'Transaction Details', icon: '🔍' },
        { id: 'personalized-insights', label: 'Personalized Insights', icon: '💡' },
        { id: 'categorization', label: 'Categorize Transaction', icon: '🏷️' }
    ];

    const savingsOptions: Array<{ id: string; label: string; icon: string; requiresGoal?: boolean }> = [
        { id: 'saving-tips', label: ' Saving Tips', icon: '💡', requiresGoal: true },
        { id: 'goal-tracking', label: 'Goal Tracking', icon: '📈' }
    ];

    const budgetOptions: Array<{ id: string; label: string; icon: string; requiresGoal?: boolean }> = [
        { id: 'monthly-insights', label: ' Budget Overview', icon: '📊' },
        { id: 'breakdown', label: ' Budget vs Actual', icon: '💰' },
        { id: 'forecast', label: ' Budget Forecast', icon: '🔮' },
        { id: 'personalized-insights', label: ' Budget Tips', icon: '💡' }
    ];

    const options = context === 'reports' ? reportsOptions : context === 'savings' ? savingsOptions : budgetOptions;

    return (
        <div className={styles.chatBotContainer}>
            {/* Chat Toggle Button */}
            <button 
                className={styles.chatToggle}
                onClick={() => setIsOpen(!isOpen)}
                title="AI Financial Assistant"
            >
                {isOpen ? '✕' : '🤖'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    {/* Chat Header */}
                    <div className={styles.chatHeader}>
                        <div className={styles.headerContent}>
                            <span className={styles.aiIcon}>🤖</span>
                            <div>
                                <h3>AI Financial Assistant</h3>
                                <p>{context === 'reports' ? 'Reports & Analytics' : context === 'savings' ? 'Savings Goals' : 'Budget Planning'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className={styles.messagesArea}>
                        {messages.length === 0 && (
                            <div className={styles.welcomeMessage}>
                                <span className={styles.welcomeIcon}>👋</span>
                                <h4>Hello! I'm your AI Financial Assistant</h4>
                                <p>Choose an option below or ask me anything about your finances!</p>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div 
                                key={message.id} 
                                className={`${styles.message} ${message.sender === 'user' ? styles.userMessage : styles.aiMessage}`}
                            >
                                <div className={styles.messageContent}>
                                    <div className={styles.messageText}>{message.text}</div>
                                    <div className={styles.messageTime}>
                                        {message.timestamp.toLocaleTimeString('en-IN', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className={`${styles.message} ${styles.aiMessage}`}>
                                <div className={styles.messageContent}>
                                    <div className={styles.typingIndicator}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Options */}
                    <div className={styles.quickOptions}>
                        <div className={styles.optionsLabel}>Quick Actions:</div>
                        <div className={styles.optionsGrid}>
                            {options.map((option) => (
                                <button
                                    key={option.id}
                                    className={styles.optionButton}
                                    onClick={() => handleQuickOption(option.id)}
                                    disabled={loading || (option.requiresGoal && !selectedGoalId)}
                                    title={option.requiresGoal && !selectedGoalId ? 'Select a goal first' : ''}
                                >
                                    <span className={styles.optionIcon}>{option.icon}</span>
                                    <span className={styles.optionLabel}>{option.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Goal Selector for Savings Context */}
                        {context === 'savings' && availableGoals.length > 0 && (
                            <div className={styles.goalSelector}>
                                <label>Select Goal for Tips:</label>
                                <select
                                    value={selectedGoalId || ''}
                                    onChange={(e) => setSelectedGoalId(Number(e.target.value))}
                                    className={styles.goalSelect}
                                >
                                    <option value="">Choose a goal...</option>
                                    {availableGoals.map(goal => (
                                        <option key={goal.id} value={goal.id}>
                                            {goal.goalName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleManualSubmit} className={styles.inputArea}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask me anything..."
                            className={styles.chatInput}
                            disabled={loading}
                        />
                        <button 
                            type="submit" 
                            className={styles.sendButton}
                            disabled={loading || !inputValue.trim()}
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
