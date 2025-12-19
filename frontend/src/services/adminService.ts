import axios from 'axios';

const API_URL = 'http://localhost:8081/api/admin';

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

// Helper function to get user role
export const getUserRole = (): string | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.role || 'USER';
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
            return null;
        }
    }
    return null;
};

// Helper function to check if user is admin
export const isAdmin = (): boolean => {
    return getUserRole() === 'ADMIN';
};

// Admin Summary DTO
export interface AdminSummary {
    totalUsers: number;
    totalTransactions: number;
}

// User DTO
export interface UserDto {
    id: number;
    email: string;
    role: string;
}

// Transaction DTO
export interface TransactionDto {
    id: number;
    name: string;
    type: string;
    amount: number;
    category: string;
    date: string;
}

// Category DTO
export interface CategoryDto {
    category: string;
    count: number;
}

/**
 * Get admin dashboard summary
 */
export const getAdminSummary = async (): Promise<AdminSummary> => {
    const token = getToken();
    const response = await axios.get<AdminSummary>(`${API_URL}/summary`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<UserDto[]> => {
    const token = getToken();
    const response = await axios.get<UserDto[]>(`${API_URL}/users`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

/**
 * Get user transactions
 */
export const getUserTransactions = async (userId: number): Promise<TransactionDto[]> => {
    const token = getToken();
    const response = await axios.get<TransactionDto[]>(`${API_URL}/users/${userId}/transactions`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

/**
 * Get all categories
 */
export const getAllCategories = async (): Promise<CategoryDto[]> => {
    const token = getToken();
    const response = await axios.get<CategoryDto[]>(`${API_URL}/categories`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

/**
 * Delete user
 */
export const deleteUser = async (userId: number): Promise<void> => {
    const token = getToken();
    await axios.delete(`${API_URL}/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

const adminService = {
    getAdminSummary,
    getAllUsers,
    getUserTransactions,
    getAllCategories,
    deleteUser,
    isAdmin,
    getUserRole
};

export default adminService;
