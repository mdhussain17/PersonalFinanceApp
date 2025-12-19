import axios from 'axios';
import { getAuthHeader } from '../components/authService';

const API_URL = 'http://localhost:8081/api/analytics';

export interface MonthlyComparison {
    month: string;
    income: number;
    expenses: number;
    savings: number;
}

export interface CategorySpending {
    category: string;
    amount: number;
    percentage: number;
}

export interface IncomeVsExpense {
    period: string;
    income: number;
    expenses: number;
}

// Get spending by category for pie chart
const getSpendingByCategory = async () => {
    return axios.get<CategorySpending[]>(`${API_URL}/spending-by-category`, { 
        headers: getAuthHeader() 
    });
};

// Get monthly comparison data
const getMonthlyComparison = async (months: number = 6) => {
    return axios.get<MonthlyComparison[]>(`${API_URL}/monthly-comparison?months=${months}`, { 
        headers: getAuthHeader() 
    });
};

// Get income vs expenses data
const getIncomeVsExpenses = async () => {
    return axios.get<IncomeVsExpense[]>(`${API_URL}/income-vs-expenses`, { 
        headers: getAuthHeader() 
    });
};

const analyticsService = {
    getSpendingByCategory,
    getMonthlyComparison,
    getIncomeVsExpenses,
};

export default analyticsService;
