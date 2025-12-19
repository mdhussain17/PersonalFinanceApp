import axios from 'axios';

const API_URL = 'http://localhost:8081/api/ai';

// Helper function to get JWT token from localStorage
const getToken = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.token;
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
            return null;
        }
    }
    return null;
};

// Helper function to get user email
const getUserEmail = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.email;
        } catch (e) {
            return null;
        }
    }
    return null;
};

// AI Insights Response
export interface AIInsights {
    insights: string;
}

// AI Forecast Response
export interface AIForecast {
    forecast: string;
}

// Auto-categorization Response
export interface AICategorization {
    category: string;
}

// Expense Trend Data structure (matches backend ExpensePredictionDto)
export interface DataPoint {
    label: string;
    value: number;
}

export interface ExpensePredictionDto {
    historicalData: DataPoint[];
    predictedData: DataPoint[];
}

// Prediction Chat Message structure
export interface PredictionChatResponse {
    predictionMessage: string;
}

/**
 * Get AI-powered monthly insights and saving tips
 * Features: Monthly Insights + Saving Tips
 */
export const getAIInsights = async (): Promise<AIInsights> => {
    const token = getToken();
    console.log('🤖 Fetching AI insights...');
    
    const response = await axios.get<AIInsights>(`${API_URL}/insights`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    console.log('✅ AI insights received:', response.data);
    return response.data;
};

/**
 * Get AI-powered forecast and spending alerts
 * Features: Predict next month expenses + Saving alerts
 */
export const getAIForecast = async (): Promise<AIForecast> => {
    const token = getToken();
    console.log('🤖 Fetching AI forecast...');
    
    const response = await axios.get<AIForecast>(`${API_URL}/forecast`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    console.log('✅ AI forecast received:', response.data);
    return response.data;
};

/**
 * Get AI-powered category suggestion for a transaction
 * Feature: Auto-categorization
 */
export const categorizeTransaction = async (description: string): Promise<string> => {
    const token = getToken();
    console.log('🤖 Getting AI category suggestion for:', description);
    
    const response = await axios.post<AICategorization>(
        `${API_URL}/categorize`,
        { description },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
    
    console.log('✅ AI category suggestion:', response.data.category);
    return response.data.category;
};

// ---
// --- NEW CHATBOT API FUNCTIONS ---
// ---

/**
 * Send a custom question to the AI chatbot
 * Backend: generateChatResponse(prompt)
 */
export const sendChatMessage = async (prompt: string): Promise<string> => {
    const token = getToken();
    console.log('💬 Sending chat message:', prompt);
    
    const response = await axios.post<string>(
        `${API_URL}/chat`,
        { prompt },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
    
    console.log('✅ Chat response received:', response.data);
    return response.data;
};

/**
 * Get spending breakdown analysis
 * Backend: generateSpendingBreakdown(transactions)
 */
export const getSpendingBreakdown = async (): Promise<string> => {
    const token = getToken();
    const email = getUserEmail();
    console.log('🤖 Fetching spending breakdown for:', email);
    
    const response = await axios.get<string>(`${API_URL}/chat/spending-breakdown`, {
        params: { userEmail: email },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    console.log('✅ Spending breakdown received:', response.data);
    return response.data;
};

/**
 * Get saving tips for a specific goal
 */
export const getSavingTips = async (goalId: number): Promise<string> => {
    const token = getToken();
    console.log('🤖 Fetching saving tips for goal:', goalId);
    
    const response = await axios.get<{ tips: string }>(`${API_URL}/saving-tips/${goalId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    console.log('✅ Saving tips received:', response.data.tips);
    return response.data.tips;
};

/**
 * Get transaction details analysis
 */
export const getTransactionDetails = async (): Promise<string> => {
    const token = getToken();
    console.log('🤖 Fetching transaction details...');
    
    const response = await axios.get<{ details: string }>(`${API_URL}/transaction-details`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    console.log('✅ Transaction details received:', response.data.details);
    return response.data.details;
};

/**
 * Get personalized financial insights
 * Backend: generatePersonalizedInsights(summary, transactions)
 */
export const getPersonalizedInsights = async (): Promise<string> => {
    const token = getToken();
    const email = getUserEmail();
    console.log('🤖 Fetching personalized insights for:', email);
    
    const response = await axios.get<string>(`${API_URL}/chat/personalized-insights`, {
        params: { userEmail: email },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    console.log('✅ Personalized insights received:', response.data);
    return response.data;
};

/**
 * Get goal tracking analysis
 */
export const getGoalTracking = async (): Promise<string> => {
    const token = getToken();
    console.log('🤖 Fetching goal tracking analysis...');
    
    const response = await axios.get<{ tracking: string }>(`${API_URL}/goal-tracking`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    console.log('✅ Goal tracking analysis received:', response.data.tracking);
    return response.data.tracking;
};

/**
 * Get expense prediction with historical and predicted data
 * Backend: getExpensePrediction(userEmail) returns ExpensePredictionDto
 */
export const getExpensePrediction = async (): Promise<ExpensePredictionDto> => {
    const token = getToken();
    console.log('📈 Fetching expense prediction...');
    
    const response = await axios.get<ExpensePredictionDto>(`${API_URL}/expense-trend`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    console.log('✅ Expense prediction received:', response.data);
    return response.data;
};

/**
 * Get AI prediction message for next month
 * Backend: generateNextMonthExpensePrediction(userEmail)
 */
export const getNextMonthPredictionChat = async (): Promise<string> => {
    const token = getToken();
    const email = getUserEmail();
    console.log('💬 Fetching next month prediction chat for:', email);
    
    const response = await axios.get<{ predictionMessage: string }>(`${API_URL}/next-month-prediction-chat`, {
        params: { userEmail: email },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    console.log('✅ Prediction chat received:', response.data);
    return response.data.predictionMessage;
};

const aiService = {
    getAIInsights,
    getAIForecast,
    categorizeTransaction,
    sendChatMessage,
    getSpendingBreakdown,
    getSavingTips,
    getTransactionDetails,
    getPersonalizedInsights,
    getGoalTracking,
    getExpensePrediction,
    getNextMonthPredictionChat
};

export default aiService;
