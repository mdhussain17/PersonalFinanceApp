import axios from 'axios';

const API_URL = 'http://localhost:8081/api/users/profile';  

interface ProfileData {
    name: string;
    email: string;
    monthlyIncome: number;
    savingsGoal: number;
    targetExpenses: number;
}

const getToken = () => {
    const userStr = localStorage.getItem('user');
    console.log('🔍 Getting token from localStorage...');
    console.log('User string from localStorage:', userStr);
    
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            console.log('Parsed user object:', user);
            console.log('Token found:', user.token ? 'Yes (length: ' + user.token.length + ')' : 'No');
            return user.token;
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
            return null;
        }
    }
    console.log('❌ No user found in localStorage');
    return null;
};

const getProfile = async () => {
    const token = getToken();
    console.log('🔐 Making GET request with token:', token ? 'Token present' : 'NO TOKEN');
    return axios.get(`${API_URL}`, {
        headers: {
            Authorization: `Bearer ${token}`// 🔐 Sends token to backend
        }
    });
};

const updateProfile = async (profileData: ProfileData) => {
    const token = getToken();
    console.log('🔐 Making PUT request with token:', token ? 'Token present' : 'NO TOKEN');
    console.log('Profile data being sent:', profileData);
    return axios.put(`${API_URL}`, profileData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

const createProfile = async (profileData: ProfileData) => {
    const token = getToken();
    console.log('🔐 Making POST request with token:', token ? 'Token present' : 'NO TOKEN');
    console.log('Profile data being sent:', profileData);
    return axios.post(`${API_URL}`, profileData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

const profileService = {
    getProfile,
    updateProfile,
    createProfile,
};

export default profileService;
