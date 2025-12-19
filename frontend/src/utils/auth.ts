// Auth utility functions
export const getAuthenticatedUser = () => {
    try {
        const user = localStorage.getItem('user');
        if (user) {
            return JSON.parse(user);
        }
        return null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        return null;
    }
};

export const isAuthenticated = () => {
    return getAuthenticatedUser() !== null;
};

export const logout = () => {
    // Clear all user-related data
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.dispatchEvent(new Event('authStateChanged'));
};

export const getUserName = () => {
    const user = getAuthenticatedUser();
    if (user) {
        // Try to get name from user object first
        const nameFromUser = user.user?.name || user.name || user.userName || user.username;
        if (nameFromUser) {
            return nameFromUser;
        }
        
        // If no name in user object, try to get from stored credentials using email
        const email = user.user?.email || user.email;
        if (email) {
            const credentials = localStorage.getItem(`user_credentials_${email}`);
            if (credentials) {
                const parsed = JSON.parse(credentials);
                return parsed.name || 'User';
            }
        }
        
        return 'User';
    }
    return '';
};

export const getUserEmail = () => {
    const user = getAuthenticatedUser();
    if (user) {
        // Get email from user object
        const email = user.user?.email || user.email || user.userEmail;
        if (email) {
            return email;
        }
        
        // Fallback: check if we have it in old localStorage (for backward compatibility)
        return localStorage.getItem('userEmail') || '';
    }
    return '';
};

export const getToken = () => {
    const user = getAuthenticatedUser();
    return user?.token || null;
};