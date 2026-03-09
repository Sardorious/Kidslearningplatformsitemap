import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { ShieldOff } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** Roles allowed to access this route. Empty array = any authenticated user. */
    allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    // Wait for auth state to resolve (avoids redirect flash on refresh)
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Not logged in → go to login, preserve intended destination
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Logged in but wrong role
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-5">
                    <ShieldOff className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-gray-800 mb-2">Access Denied</h1>
                <p className="text-gray-500 max-w-sm mb-6">
                    You don't have permission to view this page. This area is restricted to{" "}
                    <span className="font-semibold text-purple-600">
                        {allowedRoles.join(", ").toLowerCase()}
                    </span>{" "}
                    accounts.
                </p>
                <a
                    href="/"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                >
                    Go Home
                </a>
            </div>
        );
    }

    return <>{children}</>;
}
