import { authService } from './auth';
import api from './axios';

// Users API
export const userService = {
    getProfile: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },
    getProgress: async (courseId?: number) => {
        const response = await api.get('/progress', { params: { courseId } });
        return response.data;
    },
    completeLesson: async (lessonData: { lessonId: number, score?: number }) => {
        const response = await api.post('/progress/complete-lesson', lessonData);
        return response.data;
    },
    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    deleteUser: async (id: number) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    }
};

// Courses API
export const courseService = {
    getAll: async () => {
        const response = await api.get('/courses');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/courses/${id}`);
        return response.data;
    },
    create: async (courseData: any) => {
        const response = await api.post('/admin/courses', courseData);
        return response.data;
    },
    update: async (id: number, courseData: any) => {
        const response = await api.put(`/admin/courses/${id}`, courseData);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/admin/courses/${id}`);
        return response.data;
    },
    getTeacherCourses: async () => {
        const response = await api.get('/courses/teacher');
        return response.data;
    }
};

// Lessons API
export const lessonService = {
    getById: async (id: number) => {
        const response = await api.get(`/lessons/${id}`);
        return response.data;
    },
    getByCourse: async (courseId: number) => {
        const response = await api.get(`/lessons/course/${courseId}`);
        return response.data;
    },
    create: async (lessonData: any) => {
        const response = await api.post('/admin/lessons', lessonData);
        return response.data;
    },
    update: async (id: number, lessonData: any) => {
        const response = await api.put(`/admin/lessons/${id}`, lessonData);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/admin/lessons/${id}`);
        return response.data;
    }
};

// Files API
export const fileService = {
    upload: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
