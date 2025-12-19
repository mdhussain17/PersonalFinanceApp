import axios from 'axios';
import { getAuthHeader } from '../components/authService';

const API_URL = 'http://localhost:8081/api/savings-goals';

export interface SavingsGoal {
    id?: number;
    goalName: string;
    goalType?: string;
    targetAmount: number;
    currentAmount: number;
    remainingAmount?: number;  // Backend calculates this
    deadline?: string;
    userId?: number;
}

const getSavingsGoals = () => {
    console.log('🔍 Fetching savings goals from:', API_URL);
    return axios.get<SavingsGoal[]>(API_URL, { headers: getAuthHeader() })
        .then(response => {
            console.log('✅ Savings goals received:', response.data);
            return response;
        })
        .catch(error => {
            console.error('❌ Error fetching savings goals:', error);
            console.error('Response data:', error.response?.data);
            throw error;
        });
};

const createSavingsGoal = (goalData: SavingsGoal) => {
    // Remove id and userId from request body
    const { id, userId, ...dataToSend } = goalData;
    console.log('📝 Creating savings goal:', dataToSend);
    return axios.post<SavingsGoal>(API_URL, dataToSend, { headers: getAuthHeader() })
        .then(response => {
            console.log('✅ Savings goal created:', response.data);
            return response;
        })
        .catch(error => {
            console.error('❌ Error creating savings goal:', error);
            console.error('Response data:', error.response?.data);
            throw error;
        });
};

const updateSavingsGoal = (id: number, goalData: SavingsGoal) => {
    // Remove id and userId from request body
    const { id: _, userId, ...dataToSend } = goalData;
    console.log('✏️ Updating savings goal ID:', id, 'with data:', dataToSend);
    return axios.put<SavingsGoal>(`${API_URL}/${id}`, dataToSend, { headers: getAuthHeader() })
        .then(response => {
            console.log('✅ Savings goal updated:', response.data);
            return response;
        })
        .catch(error => {
            console.error('❌ Error updating savings goal:', error);
            console.error('Response data:', error.response?.data);
            throw error;
        });
};

const deleteSavingsGoal = (id: number) => {
    console.log('🗑️ Deleting savings goal:', id);
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() })
        .then(response => {
            console.log('✅ Savings goal deleted');
            return response;
        })
        .catch(error => {
            console.error('❌ Error deleting savings goal:', error);
            console.error('Response data:', error.response?.data);
            throw error;
        });
};

const savingsGoalService = {
    getSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
};

export default savingsGoalService;
