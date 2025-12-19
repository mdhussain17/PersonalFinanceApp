import axios from 'axios';

// ⭐ Backend API endpoint for transactions
const API_URL = 'http://localhost:8081/api/transactions';

// Transaction data structure
export interface Transaction {
    id?: number;
    name?: string;  // Transaction name/title (optional, auto-generated from category)
    type: 'income' | 'expense' | 'savings';  // Added 'savings' type
    amount: number;
    category: string;
    description?: string;
    date: string; // Format: YYYY-MM-DD
}

// Transaction Summary structure (matches backend TransactionSummaryDto)
export interface TransactionSummary {
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;      // NEW: Total saved across all goals
    availableBalance: number;  // NEW: (Income - Expenses) - Savings
}

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

// ⭐ CREATE: Add a new transaction
const createTransaction = async (transaction: Transaction) => {
    const token = getToken();  // Gets JWT from localStorage
    console.log('🔐 Creating transaction with token:', token ? 'Token present' : 'NO TOKEN');
    console.log('Transaction data:', transaction);
    
    return axios.post(API_URL, transaction, {
        headers: {
            Authorization: `Bearer ${token}`,  // 🔐 Authentication
            'Content-Type': 'application/json'
        }
    });
};

// ⭐ READ: Get all user's transactions
const getUserTransactions = async () => {
    const token = getToken();  // Gets JWT from localStorage
    console.log('🔐 Fetching transactions with token:', token ? 'Token present' : 'NO TOKEN');
    
    return axios.get(API_URL, {
        headers: {
            Authorization: `Bearer ${token}`  // 🔐 Authentication
        }
    });
};

// ⭐ UPDATE: Update an existing transaction
const updateTransaction = async (id: number, transaction: Transaction) => {
    const token = getToken();  // Gets JWT from localStorage
    console.log('🔐 Updating transaction ID:', id);
    
    return axios.put(`${API_URL}/${id}`, transaction, {
        headers: {
            Authorization: `Bearer ${token}`,  // 🔐 Authentication
            'Content-Type': 'application/json'
        }
    });
};

// ⭐ DELETE: Delete a transaction
const deleteTransaction = async (id: number) => {
    const token = getToken(); // Gets JWT from localStorage
    console.log('🔐 Deleting transaction ID:', id);
    
    return axios.delete(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`  // 🔐 Authentication
        }
    });
};

// ⭐ ANALYTICS: Get spending by category for charts
const getSpendingByCategory = async () => {
    const token = getToken();
    console.log('🔐 Fetching spending by category');
    
    return axios.get(`${API_URL}/spending-by-category`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// ⭐ NEW: Get transaction summary (Total Income, Total Expenses, Balance)
const getTransactionSummary = async () => {
    const token = getToken();
    console.log('🔐 Fetching transaction summary');
    
    return axios.get<TransactionSummary>(`${API_URL}/summary`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

const transactionService = {
    createTransaction,
    getUserTransactions,
    updateTransaction,
    deleteTransaction,
    getSpendingByCategory,
    getTransactionSummary, // ← NEW: For Reports & Analytics page
};

export default transactionService;
