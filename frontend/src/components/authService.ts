import axios from 'axios';

const API_URL = 'http://localhost:8081/api/auth';

// Add axios interceptors for better debugging
axios.interceptors.request.use(
    (config) => {
        console.log('🚀 Making request to:', config.url);
        console.log('📤 Request method:', config.method);
        console.log('📤 Request headers:', config.headers);
        console.log('📤 Request data:', config.data);
        return config;
    },
    (error) => {
        console.error('❌ Request setup error:', error);
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => {
        console.log('✅ Response received:', response.status, response.statusText);
        console.log('📥 Response data:', response.data);
        console.log('📥 Response headers:', response.headers);
        return response;
    },
    (error) => {
        console.error('❌ Response error details:');
        console.error('   Status:', error.response?.status);
        console.error('   Status Text:', error.response?.statusText);
        console.error('   Error Code:', error.code);
        console.error('   Error Message:', error.message);
        console.error('   Response Data:', error.response?.data);
        console.error('   Response Headers:', error.response?.headers);
        
        if (error.code === 'ERR_NETWORK') {
            console.error('🌐 This is likely a CORS or network connectivity issue');
            console.error('🔧 Check if your backend has CORS configured for http://localhost:5173');
        }
        
        return Promise.reject(error);
    }
);

const signup = (name: string, email: string, password: string) => {
    return axios.post(`${API_URL}/signup`, { name, email, password });
};

const verifyOtp = (email: string, otp: string) => {
    return axios.post(`${API_URL}/verify-otp`, { email, otp });
};

const signin = (email: string, password: string) => {
    return axios.post(`${API_URL}/signin`, { email, password });
};

const forgotPassword = (email: string) => {
    return axios.post(`${API_URL}/forgot-password`, { email });
};

const resetPassword = (email: string, otp: string, newPassword: string) => {
    return axios.post(`${API_URL}/reset-password`, { email, otp, newPassword });
};

// Helper function to get authentication headers
export const getAuthHeader = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return {
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            };
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
            return {};
        }
    }
    return {};
};

const authService = {
    signup,
    verifyOtp,
    signin,
    forgotPassword,
    resetPassword,
    getAuthHeader, // Export as part of service too
};

export default authService;