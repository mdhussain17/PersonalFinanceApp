import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '../services/adminService';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    if (!isAdmin()) {
        // Redirect to dashboard if not admin
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
