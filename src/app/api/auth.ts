import api from './axios';
import { AuthResponse, User } from '../types';

export const authService = {
    login: async (credentials: Pick<User, 'phoneNumber'> & { password?: string }): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },
    register: async (userData: Omit<User, 'id' | 'xp'> & { password?: string }): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', userData);
        return response.data;
    },
    forgotPassword: async (data: { phoneNumber: string }): Promise<any> => {
        const response = await api.post('/auth/forgot-password', data);
        return response.data;
    },
    resetPassword: async (data: any): Promise<any> => {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    }
};
