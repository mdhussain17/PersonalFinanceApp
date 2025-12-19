import axios from 'axios';
import { getAuthHeader } from '../components/authService';

const API_URL = 'http://localhost:8081/api/budgets';

export interface Budget {
    id?: number;
    category: string;
    amount: number;        // Planned amount
    startDate: string;
    endDate: string;
    userId?: number;
    spent?: number;        // ← NEW: From backend calculation
    remaining?: number;    // ← NEW: From backend calculation
}

const getBudgets = () => {
    console.log('🔍 Fetching budgets from:', API_URL);
    console.log('🔐 Auth headers:', getAuthHeader());
    return axios.get<Budget[]>(API_URL, { headers: getAuthHeader() })
        .then(response => {
            console.log('✅ Budgets received:', response.data);
            console.log('📋 First budget structure:', JSON.stringify(response.data[0], null, 2));
            return response;
        })
        .catch(error => {
            console.error('❌ Error fetching budgets:', error);
            console.error('Response data:', error.response?.data);
            console.error('Status:', error.response?.status);
            throw error;
        });
};

const createBudget = (budgetData: Budget) => {
    // Remove id and userId from request body
    const { id, userId, ...dataToSend } = budgetData;
    console.log('📝 Creating budget:', dataToSend);
    return axios.post<Budget>(API_URL, dataToSend, { headers: getAuthHeader() })
        .then(response => {
            console.log('✅ Budget created:', response.data);
            return response;
        })
        .catch(error => {
            console.error('❌ Error creating budget:', error);
            console.error('Response data:', error.response?.data);
            throw error;
        });
};

const updateBudget = (id: number, budgetData: Budget) => {
    // Remove id and userId from request body - only send category, amount, startDate, endDate
    const { id: _, userId, ...dataToSend } = budgetData;
    console.log('=== UPDATE BUDGET DEBUG ===');
    console.log('ID:', id);
    console.log('Original budgetData:', budgetData);
    console.log('Data to send (cleaned):', dataToSend);
    console.log('URL:', `${API_URL}/${id}`);
    console.log('Headers:', getAuthHeader());
    console.log('==========================');
    
    return axios.put<Budget>(`${API_URL}/${id}`, dataToSend, { headers: getAuthHeader() })
        .then(response => {
            console.log('✅ Budget updated successfully!');
            console.log('Response:', response.data);
            return response;
        })
        .catch(error => {
            console.error('❌ UPDATE FAILED!');
            console.error('Error object:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error headers:', error.response?.headers);
            throw error;
        });
};

const deleteBudget = (id: number) => {
    console.log('🗑️ Deleting budget:', id);
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() })
        .then(response => {
            console.log('✅ Budget deleted');
            return response;
        })
        .catch(error => {
            console.error('❌ Error deleting budget:', error);
            console.error('Response data:', error.response?.data);
            throw error;
        });
};

const budgetService = {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
};

export default budgetService;
