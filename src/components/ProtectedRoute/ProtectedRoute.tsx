import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser, getUserInfoFromToken } from "../../services/auth.service";

interface ProtectedRouteProps {
    allowedRoles?: string[];
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    allowedRoles,
    children,
}) => {
    const user = getCurrentUser();

    if (!user || !user.accessToken) {
        // Chưa đăng nhập -> Chuyển hướng về login
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        // Decode JWT để lấy role (localStorage chỉ lưu accessToken, không có field role)
        const userInfo = getUserInfoFromToken();
        const userRole = (userInfo?.role || '').toLowerCase();

        if (!allowedRoles.some(r => r.toLowerCase() === userRole)) {
            // Đã đăng nhập nhưng không có quyền -> 403
            return <Navigate to="/403" replace />;
        }
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
