import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/auth';
import { userService } from '../api/services';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (credentials: Pick<User, 'phoneNumber'> & { password?: string }) => Promise<void>;
    register: (userData: Omit<User, 'id' | 'xp'> & { password?: string }) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    // Normally we decode JWT or fetch user profile to get roles
                    const profile = await userService.getProfile();
                    setUser(profile);
                } catch (error) {
                    console.error('Failed to load user profile', error);
                    // Silently clear invalid/expired token — let ProtectedRoute
                    // handle redirecting protected pages. Public pages stay visible.
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        loadUser();
    }, [token]);


    const login = async (credentials: Pick<User, 'phoneNumber'> & { password?: string }) => {
        try {
            const data = await authService.login(credentials);
            const jwtToken = data.token;
            localStorage.setItem('token', jwtToken);
            setToken(jwtToken);
            // User profile will be fetched by the useEffect
        } catch (error) {
            console.error('Login failed', error);
            throw error; // Re-throw to inform caller
        }
    };

    const register = async (userData: Omit<User, 'id' | 'xp'> & { password?: string }) => {
        try {
            const data = await authService.register(userData);
            const jwtToken = data.token;
            localStorage.setItem('token', jwtToken);
            setToken(jwtToken);
        } catch (error) {
            console.error('Registration failed', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        // Only redirect to login if we're currently on a protected page.
        // Public routes (Home, Courses, Login, Register) should stay visible.
        const publicPaths = ['/', '/courses', '/login', '/register'];
        const isPublic = publicPaths.some(p =>
            window.location.pathname === p || window.location.pathname.startsWith('/courses')
        );
        if (!isPublic) {
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
