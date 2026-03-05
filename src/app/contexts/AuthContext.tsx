import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/auth';
import { userService } from '../api/services';

interface User {
    id: number;
    name: string;
    phoneNumber: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
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
                    logout();
                }
            }
            setIsLoading(false);
        };

        loadUser();
    }, [token]);

    const login = async (credentials: any) => {
        const data = await authService.login(credentials);
        const jwtToken = data.token;
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        // User profile will be fetched by the useEffect
    };

    const register = async (userData: any) => {
        const data = await authService.register(userData);
        const jwtToken = data.token;
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        window.location.href = '/login'; // Or use react-router navigate
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
